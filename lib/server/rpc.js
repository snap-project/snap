/* jshint node: true */
var through = require('through');
var _ = require('lodash');
var messages = require('../common/messages');
var RawMessageHydrator = require('../common/transformers/raw-message-hydrator');
var Primus = require('primus');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var usersMiddleware = require('./middlewares/users');
var LevelSessionStore = require('../util/level-session-store');

module.exports = function(snap, server) {

  var primusTransformer = snap.config.get('server:primus:transformer');

  var primus = server.primus = new Primus(server.httpServer, {
    pathname: '/rpc',
    transformer: primusTransformer
  });

  var sessionConfig = _.clone(snap.config.get('server:session'));

  var storeBackend = snap.storage.getGlobalStore('session');
  sessionConfig.store = new LevelSessionStore(storeBackend);

  primus.before('cookie', cookieParser(sessionConfig.secret));
  primus.before('session', expressSession(sessionConfig));
  primus.before('user', usersMiddleware(snap.users));

  // TODO Gestion des erreurs
  primus.on('error', snap.logger.error.bind(snap.logger));

  primus.on('connection', handleConnection);

  function handleConnection(spark) {

    // Copy user & session to spark
    spark.user = spark.request.user;
    spark.session = spark.request.session;

    snap.logger.info(spark.user.get('uid') + ' connected');

    var hydratorStream = RawMessageHydrator.factory();

    var interceptorStream = through(_.partial(interceptor, spark));
    var dispatcherStream = through(_.partial(dispatcher, spark));

    spark
      .pipe(hydratorStream)
      .pipe(interceptorStream)
      .pipe(snap.rpc, {end: false});

    snap.rpc
      .pipe(dispatcherStream)
      .pipe(spark);

    spark.on('end', function unpipeDispatcher() {
      snap.logger.info(spark.user.get('uid') + ' disconnected');
      snap.rpc.unpipe(dispatcherStream);
    });

  }

  function interceptor(spark, message) {

    var context = message.getContext();
    var session = spark.session;
    var user = spark.user;

    // Add some context informations to message
    context.set({
      'user': user,
      'spark': spark,
      'session': session
    });

    // If message is a RPC call, set recipient
    if(message instanceof messages.Call) {
      message.set('recipients', [user.id]);
    }

    this.queue(message);

  }

  function dispatcher(spark, message) {

    var user = spark.user;
    var noRecipients = message.get('recipients', []).length === 0;

    // If  message is broadcast message or has correct recipient
    if((noRecipients && message.get('user').id !== user.id) ||
      message.get('recipients', []).indexOf(user.id) !== -1) {
      this.queue(message);
    }

  }

};

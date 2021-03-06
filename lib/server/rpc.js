/* jshint node: true */
var through = require('through');
var _ = require('lodash');
var Message = require('../common/message');
var Primus = require('primus');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
var sessionUserMiddleware = require('./middlewares/session-user');
var LevelSessionStore = require('./util/level-session-store');

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
  primus.before('user', sessionUserMiddleware(snap.users));

  // TODO Gestion des erreurs
  primus.on('error', snap.logger.error.bind(snap.logger));

  primus.on('connection', handleConnection);

  function handleConnection(spark) {

    // Copy user & session to spark
    spark.user = spark.request.user;
    spark.session = spark.request.session;

    var interceptorStream = through(_.partial(interceptor, spark));
    var dispatcherStream = through(_.partial(dispatcher, spark));

    var messenger = snap.rpc.getMessenger();

    spark
      .pipe(interceptorStream)
      .pipe(messenger, {end: false});

    messenger
      .pipe(dispatcherStream)
      .pipe(spark);

    spark.on('end', function unpipeDispatcher() {
      messenger.unpipe(dispatcherStream);
    });

  }

  function interceptor(spark, message) {

    message = Message.hydrate(message);

    if(message) {

      var context = message.getContext();
      var session = spark.session;
      var user = spark.user;

      snap.logger.debug('New message', {user: user.toJSON(), message: message});

      // Add some context informations to message
      context.set({
        'user': user,
        'spark': spark,
        'session': session,
        'recipients': [user.get('uid')]
      });

      this.queue(message);

    }

  }

  function dispatcher(spark, message) {

    var user = spark.user;
    var noRecipients = message.get('recipients', []).length === 0;

    // If  message is broadcast message or has correct recipient
    if((noRecipients && message.get('user').get('uid') !== user.get('uid')) ||
      message.get('recipients', []).indexOf(user.get('uid')) !== -1) {
      this.queue(message);
    }

  }

};

/* jshint node: true */
var through = require('through');
var _ = require('lodash');
var messages = require('../common/messages');
var RawMessageHydrator = require('../common/transformers/raw-message-hydrator');
var usersMiddleware = require('./middlewares/users');
var cookieParser = require('cookie-parser');
var sessionMiddleware = require('./middlewares/session');
var Primus = require('primus');

module.exports = function(snap, server) {

  var primus = server.primus = new Primus(server.httpServer, {
    pathname: '/rpc',
    transformer: snap.config.get('server:primus:transformer')
  });

  primus.before('session', sessionMiddleware(snap));
  primus.before('users', usersMiddleware(snap));

  primus.on('error', console.log);

  primus.on('connection', handleConnection);

  function handleConnection(spark) {

    snap.logger.info(spark.id + ' connected');

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
      snap.logger.info(spark.id + ' disconnected');
      snap.rpc.unpipe(dispatcherStream);
    });

  }

  function interceptor(spark, message) {

    var user = spark.request.user;
    var context = message.getContext();

    // Add some context informations to message
    context.set({
      'user': user,
      'spark': spark,
      'sender': user.id,
      'session': spark.request.session
    });

    // If message is a RPC call, set recipient
    if(message instanceof messages.Call) {
      message.set('recipients', [user.id]);
    }

    this.queue(message);

  }

  function dispatcher(spark, message) {

    var request = spark.request;
    var user = request ? request.user : null;
    var noRecipients = message.get('recipients', []).length === 0;

    // If  message is broadcast message or has correct recipient
    if((noRecipients && message.get('sender') !== user.id) ||
      message.get('recipients', []).indexOf(user.id) !== -1) {
      this.queue(message);
    }

  }

};

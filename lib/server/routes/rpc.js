/* jshint node: true */
var express = require('express');
var sessionMiddleware = require('../middlewares/common/session');
var usersMiddleware = require('../middlewares/express/users');
var cookieParser = require('cookie-parser');
var through = require('through');
var _ = require('lodash');
var messages = require('../../common/messages');
var RawMessageHydrator = require('../../common/transformers/raw-message-hydrator');
var Primus = require('primus');

module.exports = function(snap, server) {

  var primus = server.primus = new Primus(server.httpServer, {
    pathname: '/rpc',
    transformer: snap.config.get('server:primus:transformer')
  });

  var sessionConfig = snap.config.get('server:session');

  primus.before('cookie', cookieParser(sessionConfig.secret));
  primus.before('session', sessionMiddleware(snap, true));
  primus.before('users', usersMiddleware(snap));

  primus.on('connection', handleConnection);

  function handleConnection(spark) {

    var hydratorStream = new RawMessageHydrator();

    hydratorStream.register('message', messages.Message.fromRaw);
    hydratorStream.register('call', messages.Call.fromRaw);
    hydratorStream.register('response', messages.Response.fromRaw);

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
      snap.rpc.unpipe(dispatcherStream);
    });

  }

  function interceptor(spark, message) {

    var user = spark.request.user;

    message.getContext().set({
      'user': user,
      'spark': spark
    });

    this.queue(message);

  }

  function dispatcher(spark, message) {

    var request = spark.request;
    var user = request ? request.user : null;

    var messageUser = message.getContext().get('user');

    var isCall = message.getType() === 'call';
    var isRPCResponse = message.getType() === 'response'
      && messageUser && user
      && user.id === messageUser.id;

    if( isCall || isRPCResponse ) {
      this.queue(message);
    }

  }

};

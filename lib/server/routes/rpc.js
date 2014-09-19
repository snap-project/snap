/* jshint node: true */
var express = require('express');
var sessionMiddleware = require('../middlewares/common/session');
var usersMiddleware = require('../middlewares/express/users');
var cookieParser = require('cookie-parser');
var through = require('through');
var _ = require('lodash');
var Message = require('../../common/message');
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

    var interceptorStream = through(_.partial(interceptor, spark));
    var dispatcherStream = through(_.partial(dispatcher, spark));

    spark
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

    if( Message.validate(message) ) {

      var user = spark.request.user;

      var meta = message.meta = message.meta || {};
      meta.user = user;
      meta.spark = spark;

      this.queue(message);

    } else {
      snap.logger.warn('RPC invalid message', message);
    }

  }

  function dispatcher(spark, message) {

    var request = spark.request;
    var user = request ? request.user : null;

    var isCall = message.type === 'call';
    var isRPCResponse = message.type === 'response'
      && user
      && user.id === message.meta.user.id;

    if( isCall || isRPCResponse ) {
      this.queue(message);
    }

  }

};

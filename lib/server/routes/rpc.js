/* jshint node: true */
var Primus = require('primus');
var express = require('express');
var sessionMiddleware = require('../middlewares/common/session');
var usersMiddleware = require('../middlewares/express/users');
var cookieParser = require('cookie-parser');
var through = require('through');
var _ = require('lodash');

var OPEN = Primus.Spark.OPEN;

module.exports = function(snap, server) {

  var httpServer = server.httpServer;
  var expressApp = server.expressApp;

  var primus = new Primus(httpServer, {
    pathname: '/rpc',
    transformer: snap.config.get('server:primus:transformer')
  });

  var sessionConfig = snap.config.get('server:session');

  primus.before('cookie', cookieParser(sessionConfig.secret));
  primus.before('session', sessionMiddleware(snap, true));
  primus.before('users', usersMiddleware(snap));

  primus.on('connection', handleConnection);

  function handleConnection(spark) {

    spark
      .pipe(through(_.partial(handleRequest, spark)))
      .pipe(snap.rpc, {end: false});

    snap.rpc
      .pipe(through(_.partial(handleResponse, spark)))
      .pipe(spark);

  }

  function handleRequest(spark, message) {

    var user = spark.request.user;

    message.meta = message.meta || {};
    message.meta.user = user;

    this.queue(message);

  }

  function handleResponse(spark, message) {

    var request = spark.request;
    var user = request ? request.user : null;

    if(user && user.id === message.meta.user.id) {
      this.queue(message);
    }

  }

};

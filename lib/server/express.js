/* jshint node: true */
var express = require('express');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var usersMiddleware = require('./middlewares/express/users');
var sessionMiddleware = require('./middlewares/common/session');

module.exports = function(snap, server) {

  // Create express application
  var expressApp = server.expressApp = express();

  // Listen for requests
  server.httpServer.addListener('request', expressApp);

  // Configure express app
  expressApp.configure(function() {

    var serverConfig = snap.config.get('server');

    expressApp.use(cookieParser(serverConfig.session.secret));
    expressApp.use(cors(serverConfig.cors));
    expressApp.use(express.urlencoded());
    expressApp.use(express.json());

    // Create session middleware
    expressApp.use(sessionMiddleware(snap));

    expressApp.use(usersMiddleware(snap));

    expressApp.use(expressApp.router);
    expressApp.use(express.static(__dirname + '/../../public'));
    expressApp.use(express.errorHandler());

  });

};

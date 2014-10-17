/* jshint node: true */
var express = require('express');
var cors = require('cors');
var http = require('http');
var cookieParser = require('cookie-parser');
var serveStatic = require('serve-static');
var errorHandler = require('errorhandler');
var usersMiddleware = require('./middlewares/users');
var sessionMiddleware = require('./middlewares/session');

module.exports = function(snap, server) {

  var expressApp = server.expressApp = express();
  var httpServer = server.httpServer = http.createServer(expressApp);

  var serverConfig = snap.config.get('server');

  expressApp.use(cors(serverConfig.cors));
  expressApp.use(sessionMiddleware(snap));
  expressApp.use(usersMiddleware(snap));

  // Initialize routes
  expressApp.use(require('./routes')(snap, server));

  expressApp.use(serveStatic(__dirname + '/../../public'));
  expressApp.use(errorHandler());

};

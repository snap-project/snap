/* jshint node: true */
var express = require('express');
var cors = require('cors');
var http = require('http');
var cookieParser = require('cookie-parser');
var serveStatic = require('serve-static');
var errorHandler = require('errorhandler');
var usersMiddleware = require('./middlewares/users');
var expressSession = require('express-session');
var _ = require('lodash');
var LevelSessionStore = require('../util/level-session-store');

module.exports = function(snap, server) {

  var expressApp = express();
  var httpServer = http.createServer(expressApp);

  // Expose httpServer & expressApp
  server.expressApp = expressApp;
  server.httpServer = httpServer;

  var serverConfig = snap.config.get('server');

  var sessionConfig = _.clone(serverConfig.session);

  var storeBackend = snap.storage.getGlobalStore('session');
  sessionConfig.store = new LevelSessionStore(storeBackend);

  // Mount middlewares
  expressApp.use(cors(serverConfig.cors));
  expressApp.use(cookieParser(sessionConfig.secret));
  expressApp.use(expressSession(sessionConfig));
  expressApp.use(usersMiddleware(snap.auth));

  // Mount routes
  expressApp.use(require('./routes')(snap, server));

  // Serve static files
  expressApp.use(serveStatic(__dirname + '/../../public'));

  // Handle routes errors
  expressApp.use(errorHandler());

};

/* jshint node: true */
var path = require('path');
var express = require('express');
var cors = require('cors');
var http = require('http');
var cookieParser = require('cookie-parser');
var serveStatic = require('serve-static');
var cons = require('consolidate');
var semiStatic = require('semi-static');
var errorHandler = require('errorhandler');
var sessionUserMiddleware = require('./middlewares/session-user');
var expressSession = require('express-session');
var themeHelpers = require('./util/express-theme-helpers');
var _ = require('lodash');
var LevelSessionStore = require('./util/level-session-store');

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

  // Configure Express App
  expressApp.engine('html', cons.lodash);
  expressApp.set('view engine', 'html');
  expressApp.locals.themeHelpers = themeHelpers;

  // Mount middlewares
  expressApp.use(cors(serverConfig.cors));
  expressApp.use(cookieParser(sessionConfig.secret));
  expressApp.use(expressSession(sessionConfig));
  expressApp.use(sessionUserMiddleware(snap.users));

  // Mount routes
  expressApp.use(require('./routes')(snap, server));

  // Serve static files

  var appRoot = path.dirname(require.main.filename);
  var defaultThemePath = __dirname + '/../../themes/default';
  var themePath = snap.config.get('theme');
  themePath =  themePath ? path.join(appRoot, themePath) : defaultThemePath;

  expressApp.use(semiStatic({
    folderPath: themePath,
    fileExt: 'html'
  }));
  expressApp.use(serveStatic(themePath));

  // Handle routes errors
  expressApp.use(errorHandler());

};

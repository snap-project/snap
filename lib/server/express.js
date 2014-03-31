/* jshint node: true */
var express = require('express');
var LevelSession = require('level-session');
var cors = require('cors');
var _ = require('lodash');
var usersMiddleware = require('./middlewares/users');

module.exports = function(snap, server) {

  // Create express application
  var expressApp = server.expressApp = express();

  // Configure express app
  expressApp.configure(function() {

    var serverConfig = snap.config.get('server');
    expressApp.use(cors(serverConfig.cors));
    expressApp.use(express.urlencoded());
    expressApp.use(express.json());

    // Get session store
    var sessionStore = snap.storage.getGlobalStore('session');
    var sessionConfig = _.extend(serverConfig.session, {
      db: sessionStore
    });
    // Create session middleware
    var sessionMiddleware = LevelSession(sessionConfig);
    expressApp.use(sessionMiddleware);
    
    expressApp.use(usersMiddleware(snap));
    
    expressApp.use(expressApp.router);
    expressApp.use(express.static(__dirname + '/../../public'));
    expressApp.use(express.errorHandler());

  });

};
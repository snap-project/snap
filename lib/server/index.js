
module.exports = function(snap) {
  
  var server = {};

  // Create express application
  var express = require('express');
  var expressApp = server.expressApp = express();

  // Configure express app
  expressApp.configure(function() {

    var serverConfig = snap.config.get('server');

    expressApp.use(express.urlencoded());
    expressApp.use(express.json());
    expressApp.use(express.cookieParser());
    expressApp.use(express.session(serverConfig.session));
    
    var usersMiddleware = require('../util/middlewares/users');
    expressApp.use(usersMiddleware(snap));
    
    expressApp.use(expressApp.router);
    expressApp.use(express.static(__dirname + '/../../public'));
    expressApp.use(express.errorHandler());

  });

  // Initialize default routes
  require('./routes')(snap, server);

  // Expose "server" API
  return server;

};
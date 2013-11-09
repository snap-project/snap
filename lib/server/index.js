
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
    expressApp.use(express.cookieSession(serverConfig.session));
    expressApp.use(expressApp.router);
    expressApp.use(express.static(__dirname + '/../../public'));
    expressApp.use(express.errorHandler());

  });

  // Initialize RPC
  server.rpc = require('./rpc')(snap, server);

  // Initialize default routes
  require('./routes')(snap, server);

  // Expose "server" API
  return server;

};
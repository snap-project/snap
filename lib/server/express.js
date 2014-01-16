/* jshint node: true */
var express = require('express');
//var usersMiddleware = require('./middlewares/users');

module.exports = function(snap, server) {

  // Create express application
  var expressApp = server.expressApp = express();

  // Configure express app
  expressApp.configure(function() {

    var serverConfig = snap.config.get('server');

    expressApp.use(express.urlencoded());
    expressApp.use(express.json());
    expressApp.use(express.cookieParser());
    expressApp.use(express.session(serverConfig.session));
    
    //expressApp.use(usersMiddleware(snap));
    
    expressApp.use(expressApp.router);
    expressApp.use(express.static(__dirname + '/../../public'));
    expressApp.use(express.errorHandler());

  });

};
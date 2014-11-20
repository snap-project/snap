/* jshint node: true */
var express = require('express');

module.exports = function() {

  var app = express();


  // Serve apps files
  app.get('/login', handleLogin);
  app.get('/logout', handleLogout);


  function handleLogin(req, res, next) {

  }

  function handleLogout(req, res) {

  }

  return app;

};

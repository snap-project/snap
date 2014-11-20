/* jshint node: true */
var express = require('express');

module.exports = function(snap, server) {

  var app = express();

  app.use('/scripts', require('./scripts')(snap, server));
  app.use('/apps', require('./apps')(snap, server));
  app.use('/auth', require('./auth')(snap, server));

  return app;

};

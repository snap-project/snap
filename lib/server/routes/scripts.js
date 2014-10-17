/* jshint node: true */
var express = require('express');
var browserify = require('browserify-middleware');

module.exports = function(snap, server) {

  var app = express();

  // Serve Supervisor bootstraping script
  app.get('/supervisor.js', browserify('../../client/bootstrap/supervisor.js'));

  // Serve plugin scripts bootstrap
  app.get('/bootstrap.js', snap.plugins.handlePluginsBootstrap);

  // Serve plugins scripts
  app.get('/plugins.js', pluginsHandler);

  function pluginsHandler(req, res, next) {
    var clientScripts = snap.plugins.getClientScripts();
    var hasScripts =  clientScripts.length > 0;
    if(hasScripts) {
      var scriptsHandler = browserify(clientScripts);
      return scriptsHandler(req, res, next);
    } else {
      return res.send(204);
    }
  }
  
  return app;

};

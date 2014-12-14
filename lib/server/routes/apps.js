/* jshint node: true */
var express = require('express');
var path = require('path');
var browserify = require('browserify-middleware');
var serveStatic = require('serve-static');

module.exports = function(snap) {

  var app = express();

  // Serve apps files
  app.get('/', handleDefaultApp);
  app.get('/:appName', handleApp);
  app.get('/:appName/*', handleApp);

  function handleApp(req, res, next) {
    var appsRoot = path.resolve(snap.config.get('apps:dir'));
    var staticHandler = serveStatic(appsRoot);
    req.url = req.url.replace(/^\/apps/, '');
    return staticHandler(req, res, next);
  }

  function handleDefaultApp(req, res) {
    var defaultApp = snap.config.get('apps:default');
    return res.redirect('/apps/'+defaultApp);
  }

  // Serve Snap application client
  app.get('/:appName/snap.js', browserify('../../client/bootstrap/snap.js'));

  return app;

};

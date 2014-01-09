var express = require('express');
var path = require('path');
var browserify = require('browserify-middleware');

/* jshint node: true */
module.exports = function(snap, server) {

  var expressApp = server.expressApp;

  // Define HTTP routes

  // Serve Supervisor bootstraping script
  expressApp.get(
    '/supervisor.js',
    browserify('../client/bootstrap/supervisor.js')
  );

  expressApp.get('/apps/', handleDefaultApp);
  expressApp.get('/apps/:appName', handleApp);

  // Serve Snap application client
  expressApp.get(
    '/apps/:appName/snap.js',
    browserify('../client/bootstrap/snap.js')
  );

  // Handle App assets
  expressApp.get('/apps/:appName/*', handleApp);

  function handleInjects(req, res, next) {
    expressApp.set('Content-Type', 'text/javascript');
    return res.send(snap.client.supervisor.renderInjections());
  }
  
  function handleApp(req, res, next) {
    var appsRoot = path.resolve(snap.config.get('apps:dir'));
    var staticHandler = express.static(appsRoot);
    req.url = req.url.replace('/apps', '');
    return staticHandler(req, res, next);
  }

  function handleDefaultApp(req, res, next) {
    var defaultApp = snap.config.get('apps:default');
    return res.redirect('/apps/'+defaultApp)
  }

};
var express = require('express');
var path = require('path');

/* jshint node: true */
module.exports = function(snap, server) {

  var expressApp = server.expressApp;

  expressApp.get('/supervisor.js', handleSupervisor);

  expressApp.get('/apps/', handleDefaultApp);
  expressApp.get('/apps/:appName', handleApp);
  expressApp.get('/apps/:appName/*', handleApp);
  expressApp.get('/apps/*', handleApp);

  function handleSupervisor(req, res, next) {
    expressApp.set('Content-Type', 'text/javascript');
    return res.send(snap.client.supervisor.render());
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
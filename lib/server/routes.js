var express = require('express');
var path = require('path');

module.exports = function(snap, server) {

  var expressApp = server.expressApp;

  expressApp.get('/supervisor.js', snap.client.handleSupervisor);

  expressApp.get('/apps/', handleDefaultApp);
  expressApp.get('/apps/:appName', handleApp);
  expressApp.get('/apps/:appName/*', handleApp);
  expressApp.get('/apps/*', handleApp);
  
  function handleApp(req, res, next) {
    var appsRoot = path.resolve(snap.config.get('apps:dir'));
    var staticHandler = express.static(appsRoot);
    req.url = req.url.replace('/apps', '');
    return staticHandler(req, res, next);
  }

  function handleDefaultApp(req, res, next) {
    var defaultApp = snap.config.get('apps:default');
    res.redirect('/apps/'+defaultApp)
  }


};
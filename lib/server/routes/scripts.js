/* jshint node: true */
var browserify = require('browserify-middleware');

module.exports = function(snap, server) {

  var expressApp = server.expressApp;

  // Serve Supervisor bootstraping script
  expressApp.get(
    '/scripts/supervisor.js',
    browserify('../../client/bootstrap/supervisor.js')
  );

  var scriptsHandler = browserify(
    snap.plugins.getClientScripts()
  );

  // Serve plugins scripts
  expressApp.get(
    '/scripts/plugins.js',
    function handlePlugins(req, res, next) {
      var clientScripts = snap.plugins.getClientScripts();
      var hasScripts =  clientScripts.length > 0;
      if(hasScripts) {
        return scriptsHandler(req, res, next);
      } else {
        return res.send(204);
      }
    }
  );

  // Serve plugin scripts bootstrap
  expressApp.get(
    '/scripts/bootstrap.js',
    snap.plugins.handlePluginsBootstrap
  );

    // Serve Snap application client
  expressApp.get(
    '/apps/:appName/snap.js',
    browserify('../../client/bootstrap/snap.js')
  );

};
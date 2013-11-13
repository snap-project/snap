
module.exports = function(snap) {

  snap.server.apps = require('./server')(snap);
  snap.client.inject(__dirname + '/client.js');

  snap.server.expose('apps:getAppManifest', function(params, cb) {
    var appName = params[0] || params.appName;
    return snap.server.apps.getAppManifest(appName, cb);
  });

  snap.server.expose('apps:getAppsList', function(params, cb) {
    return snap.server.apps.getAppsList(cb);
  });

};
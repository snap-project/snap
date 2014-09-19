/* jshint node: true */
module.exports = function(snap) {

  var apps = snap.apps = require('./server')(snap);

  var rpc = snap.rpc;

  rpc.expose('apps', 'getAppManifest', function(params, cb) {
    var appName = params[0] || params.appName;
    return apps.getAppManifest(appName, cb);
  });

  rpc.expose('apps', 'getAppsList', function(params, cb) {
    return apps.getAppsList(cb);
  });

  snap.plugins.injectClientSide(__dirname + '/client.js');

};

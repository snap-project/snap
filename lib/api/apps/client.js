module.exports = function(Snap) {

  var rpc = Snap.rpc;

  function AppsServiceFactory(appName, config) {

    var apps = {};

    apps.getAppManifest = function(appName, cb) {
      rpc.call('apps:getAppManifest', [appName], function(err, results) {
        if(err) {
          return cb(err);
        }
        return cb(null, results[0]);
      });
      return apps;
    };

    apps.getAppsList = function(cb) {
      rpc.call('apps:getAppsList', [], function(err, results) {
        if(err) {
          return cb(err);
        }
        return cb(null, results[0]);
      });
      return apps;
    };

    apps.getCurrentApp = function() {
      return Snap.getCurrentApp();
    };

    apps.loadApp = function(appName) {
      Snap.loadApp(appName);
      return apps;
    };

    return apps;

  }

  Snap.registerService('apps', AppsServiceFactory);

};
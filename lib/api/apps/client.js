module.exports = function() {

  var rpc = this.rpc;

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

    return apps;

  }

  this.registerService('apps', AppsServiceFactory);

};
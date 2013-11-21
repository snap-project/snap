module.exports = function(Snap) {

  function SystemServiceFactory(appName, config) {

    var system = {};

    system.getNetworkAddresses = function(cb) {
      Snap.rpc.call('system:getNetworkAddresses', [], function(err, results) {
        if(err) {
          return cb(err);
        }
        return cb(null, results[0]);
      });
      return system;
    };

    system.getServerExternalURL = function(cb) {
      Snap.rpc.call('system:getServerExternalURL', [], function(err, results) {
        if(err) {
          return cb(err);
        }
        return cb(null, results[0]);
      });
      return system;
    };

    return system;

  }

  Snap.registerService('system', SystemServiceFactory);

};
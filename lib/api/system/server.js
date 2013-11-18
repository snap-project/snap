var os = require('os');
var _ = require('lodash');

module.exports = function(snap) {

  var system = {};

  system.getNetworkAddresses = function() {
    var interfaces = os.networkInterfaces();
    return _(os.networkInterfaces())
            .values()
            .flatten()
            .value();
  };

  system.getServerExternalURL = function() {
    var port = snap.config.get('server:port');
    var adresses = system.getNetworkAddresses();
    return adresses.reduce(function(prev, curr) {
      if(curr.family === 'IPv4' && !curr.internal) {
        prev.push('http://' +  curr.address + ':' + port + '/');
      }
      return prev;
    }, []);
  };

  return system;

};
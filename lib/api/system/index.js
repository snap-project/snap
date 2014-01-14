module.exports = function(snap) {

  var system = snap.system = require('./server')(snap);

  // Expose server API to client

  snap.rpc.expose('system', 'getNetworkAddresses', function(params, cb) {
    return cb(null, system.getNetworkAddresses());
  });

  snap.rpc.expose('system', 'getServerExternalURL', function(params, cb) {
    return cb(null, system.getServerExternalURL());
  });

  snap.plugins.injectClientSide(__dirname + '/client.js');

};
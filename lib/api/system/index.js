module.exports = function(snap) {

  var system = snap.server.system = require('./server')(snap);

  // Expose server API to client

  snap.server.expose('system:getNetworkAddresses', function(params, cb) {
    return cb(null, system.getNetworkAddresses());
  });

  snap.server.expose('system:getServerExternalURL', function(params, cb) {
    return cb(null, system.getServerExternalURL());
  });

  snap.client.inject(__dirname + '/client.js');

};
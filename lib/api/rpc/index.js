/* jshint node: true */
var rpc = require('./rpc');

module.exports = function(snap) {

  var expressApp = snap.server.expressApp;
  // Initialize RPC route
  expressApp.post('/rpc', require('./rpc-handler'));

  // Inject RPC service
  snap.client.inject(__dirname + '/rpc-service.js');

  snap.server.rpc = rpc;
  // Convenience method
  snap.server.expose = rpc.expose;

  return rpc;

};
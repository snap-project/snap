/* jshint node: true */

// Initialize server base API

module.exports = function(snap) {

  var server = {};

  // Initialize Express server
  require('./express')(snap, server);

  // Initialize RPC server
  require('./rpc')(snap, server);

  // Expose "server" API
  return server;

};

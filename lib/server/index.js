/* jshint node: true */

// Initialize server base API

module.exports = function(snap) {

  var server = {};

  // Initialize HTTP server
  require('./http-server')(snap, server);
  // Initialize Express "application"
  require('./express')(snap, server);
  // Initialize default routes
  require('./routes')(snap, server);

  // Expose "server" API
  return server;

};

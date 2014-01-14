// Initialize server base API

module.exports = function(snap) {
  
  var server = {};

  // Initialize Express "application"
  require('./express')(snap, server);
  // Initialize default routes
  require('./routes')(snap, server);

  // Expose "server" API
  return server;

};
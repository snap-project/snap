// Initialize HTTP routes
module.exports = function(snap, server) {

  require('./scripts')(snap, server);
  require('./rpc')(snap, server);
  require('./apps')(snap, server);

};
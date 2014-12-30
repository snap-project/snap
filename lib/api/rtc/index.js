/* jshint node: true */
module.exports = function(snap) {

  // Expose RPC API
  require('./rpc')(snap);

  // Inject client side code
  snap.plugins.injectClientSide(__dirname + '/client.js');

};

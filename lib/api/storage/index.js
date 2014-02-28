module.exports = function(snap) {

  // Expose storage server API
  snap.storage = require('./server')(snap);

  // Expose RPC
  require('./rpc')(snap);

};
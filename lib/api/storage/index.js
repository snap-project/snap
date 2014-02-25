

module.exports = function(snap) {

  snap.storage = require('./server')(snap);

  // Expose RPC
  require('./rpc')(snap);

};
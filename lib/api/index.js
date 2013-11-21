module.exports = function(snap) {
  require('./rpc')(snap);
  require('./apps')(snap);
  require('./users')(snap);
};
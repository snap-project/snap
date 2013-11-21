module.exports = function(snap) {
  require('./rpc')(snap);
  require('./system')(snap);
  require('./apps')(snap);
  require('./users')(snap);
};
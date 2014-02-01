/* jshint node: true */
module.exports = function(snap) {
  require('./rpc')(snap);
  require('./storage')(snap);
  require('./plugins')(snap);
  require('./users')(snap);
  require('./system')(snap);
  require('./apps')(snap);
};
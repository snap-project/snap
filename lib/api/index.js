/* jshint node: true */
module.exports = function(snap) {
  require('./rpc')(snap);
  require('./storage')(snap);
  require('./users')(snap);
  require('./plugins')(snap);
  require('./system')(snap);
  require('./apps')(snap);
};
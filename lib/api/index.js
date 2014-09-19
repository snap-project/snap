/* jshint node: true */
module.exports = function(snap) {
  require('./rpc')(snap);
  require('./plugins')(snap);
  require('./storage')(snap);
  require('./users')(snap);
  require('./system')(snap);
  require('./apps')(snap);
  require('./events')(snap);
};

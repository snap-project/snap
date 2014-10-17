/* jshint node: true */
module.exports = function(snap) {
  require('./rpc')(snap);
  require('./plugins')(snap);
  require('./storage')(snap);
  require('./users')(snap);
  require('./auth')(snap);
  require('./system')(snap);
  require('./apps')(snap);
  require('./messages')(snap);
};

/* jshint node: true */
var RPC = require('../../common/rpc').RPC;

module.exports = function(snap) {
  snap.rpc = new RPC();
  snap.rpc.on('error', function(err) {
    snap.logger.error(err.stack || err.name, {source: 'RPC'});
  });
};

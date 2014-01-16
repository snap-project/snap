/* jshint node: true */
var RPC = require('../../common/rpc');

module.exports = function(snap) {
  snap.rpc = new RPC();
};
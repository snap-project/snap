/* jshint node: true */
var util = require('util');
var RPCError = require('./rpc-error');

function RPCParseError() {
  RPCError.call(this);
  this.name = 'RPCParseError';
  this.message = 'Invalid JSON was received by the server.';
  this.code = -32700;
};

util.inherits(RPCParseError, RPCError);

module.exports = RPCParseError;
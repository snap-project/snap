/* jshint node: true */
var util = require('util');
var RPCError = require('./rpc-error');

function RPCInvalidRequestError() {
  RPCError.call(this);
  this.name = 'RPCInvalidRequestError';
  this.message = 'The JSON sent is not a valid Request object.';
  this.code = -32600;
};

util.inherits(RPCInvalidRequestError, RPCError);

module.exports = RPCInvalidRequestError;
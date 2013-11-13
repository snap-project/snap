/* jshint node: true */
var util = require('util');

function RPCInvalidRequestError() {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'RPCInvalidRequestError';
  this.message = 'The RPC request is malformed or invalid !';
};

util.inherits(RPCInvalidRequestError, Error);

module.exports = RPCInvalidRequestError;
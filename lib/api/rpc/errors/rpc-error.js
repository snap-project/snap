/* jshint node: true */
var util = require('util');

function RPCError() {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'RPCError';
  this.message = 'RPC Error';
};

util.inherits(RPCError, Error);

RPCError.prototype.toJSON = function() {
  return {
    code: this.code,
    message: this.message,
    data: this.data
  };
};

module.exports = RPCError;
/* jshint node: true */
var util = require('util');

function RPCInvalidMethodError(fName) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'RPCInvalidMethodError';
  this.message = 'The method ' + fName + ' is not defined !';
  this.method = fName;
};

util.inherits(RPCInvalidMethodError, Error);

module.exports = RPCInvalidMethodError;
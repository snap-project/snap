/* jshint node: true, browser: true */
var util = require('util');

function InvalidResponseError(srcMessage) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = 'Invalid RPC response !';
  this.srcMessage = srcMessage;
}

util.inherits(InvalidResponseError, Error);

module.exports = InvalidResponseError;

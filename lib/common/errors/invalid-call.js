/* jshint node: true, browser: true */
var util = require('util');

function InvalidCallError(rawMessage) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = 'Invalid RPC call !';
  this.raw = rawMessage;
}

util.inherits(InvalidCallError, Error);

module.exports = InvalidCallError;

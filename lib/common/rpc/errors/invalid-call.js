/* jshint node: true, browser: true */
var util = require('util');

function InvalidCallError(srcMessage) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = 'Invalid RPC call !';
  this.srcMessage = srcMessage;
}

util.inherits(InvalidCallError, Error);

module.exports = InvalidCallError;

/* jshint node: true, browser: true */
var util = require('util');

function InternalError(error) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = 'An internal error append !';
  this.error = error;
}

util.inherits(InternalError, Error);

module.exports = InternalError;
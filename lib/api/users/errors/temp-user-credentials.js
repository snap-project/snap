/* jshint node:true */
var util = require('util');

function TempUserCredentials() {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'TempUserCredentials';
  this.message = 'Cannot change credentials of a temporary user ! Please register first.';
}

util.inherits(TempUserCredentials, Error);

module.exports = TempUserCredentials;

/* jshint node: true, browser: true */
var util = require('util');

function RemoteError(err) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.remote = err;
  if(err && err.message) {
    this.message = err.message;
  } else {
    this.message = 'No message transmitted !';
  }
}

util.inherits(RemoteError, Error);

module.exports = RemoteError;
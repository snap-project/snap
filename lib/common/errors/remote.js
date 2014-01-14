var util = require('util');

function RemoteError(err) {
  Error.call(this); //super constructor
  Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object
  this.name = this.constructor.name; //set our function’s name as error name.
  this.remote = err;
  if(err && err.message) {
    this.message = err.message;
  } else {
    this.message = 'No message transmitted !';
  }
}

// inherit from Error
util.inherits(RemoteError, Error);

module.exports = RemoteError;
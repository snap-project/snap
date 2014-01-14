var util = require('util');

function InternalError(error) {
  Error.call(this); //super constructor
  Error.captureStackTrace(this, this.constructor); //super helper method to include stack trace in error object
  this.name = this.constructor.name; //set our function’s name as error name.
  this.message = 'An internal error append !'; //set the error message
  this.error = error;
}

// inherit from Error
util.inherits(InternalError, Error);

module.exports = InternalError;
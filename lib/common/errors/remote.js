/* jshint node: true, browser: true */
var util = require('util');

function RemoteError(rawError) {
  Error.call(this);
  if(typeof Error.captureStackTrace === 'function') { // AKA if not IE
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error()).stack;
  }
  this.name = rawError.name;
  this.message = rawError.message;
}

RemoteError.serialize = function(err) {
  return {
    name: err.name,
    message: err.message
  };
};

util.inherits(RemoteError, Error);

module.exports = RemoteError;

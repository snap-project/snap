/* jshint node: true, browser: true */
var util = require('util');

function RemoteError(rawError) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
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

/* jshint node:true */
var util = require('util');

function BadCredentials() {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'BadCredentials';
  this.message = 'Bad credentials !';
}

util.inherits(BadCredentials, Error);

module.exports = BadCredentials;

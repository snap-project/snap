/* jshint node:true */
var util = require('util');

function InvalidCredentialsFormat() {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'InvalidCredentialsFormat';
  this.message = 'The format of the provided credentials is incompatible with \
    the current authentication backend !'
  ;
}

util.inherits(InvalidCredentialsFormat, Error);

module.exports = InvalidCredentialsFormat;

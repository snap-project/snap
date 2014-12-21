/* jshint node:true */
var util = require('util');

function InvalidUser() {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'InvalidUser';
  this.message = '"user" should be  an instance of User !';
}

util.inherits(InvalidUser, Error);

module.exports = InvalidUser;

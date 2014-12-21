/* jshint node:true */
var util = require('util');

function UserAlreadyExists(username) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'UserAlreadyExists';
  this.message = 'User "'+username+'" already exists !';
}

util.inherits(UserAlreadyExists, Error);

module.exports = UserAlreadyExists;

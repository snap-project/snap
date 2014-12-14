/* jshint node:true */
var util = require('util');

function UserNotFound(uid) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = 'UserNotFound';
  this.message = 'User "'+uid+'" not found !';
}

util.inherits(UserNotFound, Error);

module.exports = UserNotFound;

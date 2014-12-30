/* jshint node: true, browser: true */
var util = require('util');

function UnknownMethodError(namespace, method) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = 'Unknown method ' + namespace + ':' + method + ' !';
}

util.inherits(UnknownMethodError, Error);

module.exports = UnknownMethodError;
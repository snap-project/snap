/* jshint node: true */
var util = require('util');
var RPCError = require('./rpc-error');

function RPCInvalidMethodError(fName) {
  RPCError.call(this);
  this.name = 'RPCInvalidMethodError';
  this.message = 'The method ' + fName + ' does not exist / is not available.';
  this.data = {
    method: fName
  };
  this.code = -32601;
};

util.inherits(RPCInvalidMethodError, RPCError);

module.exports = RPCInvalidMethodError;
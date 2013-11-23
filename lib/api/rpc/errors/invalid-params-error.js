/* jshint node: true */
var util = require('util');
var RPCError = require('./rpc-error');

function RPCInvalidParamsError() {
  RPCError.call(this);
  this.name = 'RPCInvalidParamsError';
  this.message = 'Invalid method parameter(s).';
  this.code = -32602;
};

util.inherits(RPCInvalidParamsError, RPCError);

module.exports = RPCInvalidParamsError;
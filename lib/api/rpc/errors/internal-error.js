/* jshint node: true */
var util = require('util');
var RPCError = require('./rpc-error');

function RPCInternalError(err) {
  RPCError.call(this);
  this.name = 'RPCInternalError';
  this.message = 'Internal JSON-RPC error';
  this.code = -32603;
  if(process.env.NODE_ENV === 'development') {
    this.data = {
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack
      }
    };
  }
};

util.inherits(RPCInternalError, RPCError);

module.exports = RPCInternalError;
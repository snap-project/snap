/* jshint node: true */
var _ = require('lodash');

var RPCError = require('./errors/rpc-error');
var RPCInternalError = require('./errors/internal-error');
var RPCParseError = require('./errors/parse-error');
var RPCInvalidRequestError = require('./errors/invalid-request-error');

exports.validateRPCRequest = function(req) {
  
  if(req && _.isObject(req)) {

    if(!req.method || !_.isString(req.method)) {
      throw new RPCInvalidRequestError();
    }
    
    if(req.params && (!_.isArray(req.params) || !_.isObject(req.params))) {
      throw new RPCInvalidRequestError();
    }

  } else {
    throw new RPCParseError();
  }

};

exports.serializeError = function(err) {
  var isRPCError = err instanceof RPCError;
  if(isRPCError) {
    return err;
  } else {
    return new RPCInternalError(err);
  }
};


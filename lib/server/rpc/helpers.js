/* jshint node: true */
var _ = require('lodash');

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
    throw new RPCInvalidRequestError();
  }

}
/* jshint node: true, browser: true */
var Message = require('../message');
var util = require('util');

function Response(callID, resultOrError) {
  Message.call(this);
  this.type = 'response';
  this.id = callID;
  if(resultOrError instanceof Error) {
    this.error = serializeError(resultOrError);
  } else {
    this.result = resultOrError;
  }
}

function serializeError(err) {
  return {
    code: err.code,
    name: err.name,
    message: err.message
  };
};

util.inherits(Response, Message);

module.exports = Response;
var Message = require('../message');
var util = require('util');

function Response(callID, resultOrError) {
  Message.call(this);
  this.type = 'response';
  this.id = callID;
  if(resultOrError instanceof Error) {
    this.error = resultOrError;
  } else {
    this.result = resultOrError;
  }
}

util.inherits(Response, Message);

module.exports = Response;
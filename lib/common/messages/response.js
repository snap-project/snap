var Message = require('../message');
var util = require('util');

function Response(callID, resultOrError) {
  Message.call(this);
  this._callID = callID;
  if(resultOrError instanceof Error) {
    this._error = resultOrError;
  } else {
    this._result = resultOrError;
  }
}

util.inherits(Response, Message);

Response.TYPE = 'response';

module.exports = Response;

var p = Response.prototype;

p.toJSON = function() {
  var raw = {
    type: Response.TYPE,
    id: this._callID
  };
  if(this._error) {
    raw.error = this._error;
  } else {
    raw.result = this._result;
  }
  return raw;
};
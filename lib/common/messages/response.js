/* jshint node: true, browser: true */
var Message = require('../message');
var util = require('util');
var RemoteError = require('../errors/remote');

function Response(callId, resultOrError) {

  Message.call(this);

  this.type = 'response';

  this.data = {
    id: callId
  };

  if(resultOrError instanceof Error) {
    this.data.error = RemoteError.serialize(resultOrError);
  } else {
    this.data.result = resultOrError;
  }

}

util.inherits(Response, Message);

Response.validate = function(raw) {
  return Message.validate(raw);
};

Response.fromRaw = function(raw) {

  if(!Response.validate(raw)) {
    return null;
  }

  var res = new Response(
    raw.data.id,
    raw.data.error ? new RemoteError(raw.data.error) : raw.data.result
  );

  return res;

};

var p = Response.prototype;

p.getId = function() {
  return this.data.id;
};

p.getResult = function() {
  return this.data.result;
};

p.getError = function() {
  return this.data.error;
};

p.hasError = function() {
  return !!this.data.error;
};

module.exports = Response;

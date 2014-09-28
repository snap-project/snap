/* jshint node: true, browser: true */
var Message = require('./message');
var util = require('util');
var RemoteError = require('../errors/remote');

function Response(callId, resultOrError) {

  Message.call(this);

  this._type = 'response';

  this._payload = {
    id: callId
  };

  if(resultOrError instanceof Error) {
    this._payload.error = RemoteError.serialize(resultOrError);
  } else {
    this._payload.result = resultOrError;
  }

}

util.inherits(Response, Message);

Response.validate = function(raw) {
  return Message.validate(raw);
};

Response.hydrate = function(raw) {

  if(!Response.validate(raw)) {
    return null;
  }

  var res = new Response(
    raw.payload.id,
    raw.payload.error ? new RemoteError(raw.payload.error) : raw.payload.result
  );

  Message.populate(res, raw);

  return res;

};

var p = Response.prototype;

p.getId = function() {
  return this._payload.id;
};

p.getResult = function() {
  return this._payload.result;
};

p.getError = function() {
  return this._payload.error;
};

p.hasError = function() {
  return !!this._payload.error;
};

module.exports = Response;

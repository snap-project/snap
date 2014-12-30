/* jshint node: true, browser: true */
var Message = require('../../message');
var util = require('util');
var RemoteError = require('../errors/remote');

function Response(callId, resultOrError) {

  Message.call(this);

  this._type = Response.MESSAGE_TYPE;

  this._payload = {
    id: callId
  };

  if(resultOrError instanceof Error) {
    this._payload.error = RemoteError.serialize(resultOrError);
  } else {
    this._payload.result = resultOrError;
  }

}

Response.MESSAGE_TYPE = 'rpc:response';

util.inherits(Response, Message);

Response.fromMessage = function(message) {

  if(!message instanceof Message) {
    throw new Error('message is not a valid Message instance !');
  }

  var payload = message.getPayload();

  var res = new Response(
    payload.id,
    payload.error ? new RemoteError(payload.error) : payload.result
  );

  res.setContext(message.getContext());

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

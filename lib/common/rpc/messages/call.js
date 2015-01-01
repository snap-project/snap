/* jshint node: true, browser: true */
var Message = require('../../message');
var util = require('util');
var uuid = require('node-uuid');

var slice = Array.prototype.slice;

function Call(namespace, method, needResponse) {
  Message.call(this, Call.MESSAGE_TYPE);
  this._payload = {
    id: needResponse ? uuid.v4() : undefined,
    namespace: namespace,
    method: method,
    params: []
  };
}

Call.MESSAGE_TYPE = 'rpc:call';

util.inherits(Call, Message);

module.exports = Call;

Call.fromMessage = function(message) {

  if(!message instanceof Message) {
    throw new Error('message is not a valid Message instance !');
  }

  var payload = message.getPayload();

  var call = new Call(
    payload.namespace,
    payload.method,
    !!payload.id
  );

  call.setId(payload.id);
  call.setParams(payload.params);

  call.setContext(message.getContext());

  return call;
};

var p = Call.prototype;

p.setParams = function(params) {
  this._payload.params = params;
  return this;
};

p.addParams = function() {
  var params = this._payload.params || [];
  this._payload.params = params.concat(slice.call(arguments));
  return this;
};

p.getNamespace = function() {
  return this._payload.namespace;
};

p.getMethod = function() {
  return this._payload.method;
};

p.getParams = function() {
  return this._payload.params;
};

p.getId = function() {
  return this._payload.id;
};

p.setId = function(id) {
  this._payload.id = id;
  return this;
};

p.needResponse = function() {
  return !!this._payload.id;
};

/* jshint node: true, browser: true */
var Message = require('./message');
var util = require('util');
var uuid = require('node-uuid');

var slice = Array.prototype.slice;

function Call(namespace, method, needResponse) {
  Message.call(this);
  this._type = 'call';
  this._payload = {
    id: needResponse ? uuid.v4() : undefined,
    namespace: namespace,
    method: method,
    params: []
  };
}

util.inherits(Call, Message);

module.exports = Call;

Call.validate = function(raw) {
  return Message.validate(raw);
};

Call.fromRaw = function(raw) {

  if(!Call.validate(raw)) {
    return null;
  }

  var call = new Call(
    raw.payload.namespace,
    raw.payload.method,
    !!raw.payload.id
  );

  call.setId(raw.payload.id);
  call.setParams(raw.payload.params);

  return call;
};

var p = Call.prototype;

p.setParams = function(params) {
  this._payload.params = params;
  return this;
};

p.addParams = function() {
  this._payload.params = (this._payload.params || []).concat(slice.call(arguments));
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
}

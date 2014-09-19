/* jshint node: true, browser: true */
var Message = require('../message');
var util = require('util');
var uuid = require('node-uuid');

var slice = Array.prototype.slice;

function Call(namespace, method, needResponse) {
  Message.call(this);
  this.type = 'call';
  this.data = {
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
    raw.data.namespace,
    raw.data.method,
    !!raw.data.id
  );

  call.setId(raw.data.id);
  call.setParams(raw.data.params);

  return call;
};

var p = Call.prototype;

p.setParams = function(params) {
  this.data.params = params;
  return this;
};

p.addParams = function() {
  this.data.params = (this.data.params || []).concat(slice.call(arguments));
  return this;
};

p.getNamespace = function() {
  return this.data.namespace;
};

p.getMethod = function() {
  return this.data.method;
};

p.getParams = function() {
  return this.data.params;
};

p.getId = function() {
  return this.data.id;
};

p.setId = function(id) {
  this.data.id = id;
  return this;
};

p.needResponse = function() {
  return !!this.data.id;
}

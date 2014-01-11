var Message = require('../message');
var util = require('util');

var slice = Array.prototype.slice;

function Call(namespace, method, needResponse) {
  Message.call(this);
  this._id = null;
  this._params = [];
  this._namespace = namespace;
  this._method = method;
  if(needResponse) {
    this._id = Date.now();
  } else {
    this._id = null;
  }
}

util.inherits(Call, Message);

Call.TYPE = 'call';

module.exports = Call;

var p = Call.prototype;

p.getID = function() {
  return this._id;
};

p.addParams = function() {
  this._params = this._params.concat(slice.call(arguments));
};

p.toJSON = function() {
  return {
    type: Call.TYPE,
    params: this._params.length ? this._params : undefined,
    id: this._id ? this._id : undefined,
    method: this._method,
    namespace: this._namespace
  };
};
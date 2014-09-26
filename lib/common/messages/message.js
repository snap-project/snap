/* jshint node: true, browser: true */
var _ = require('lodash');

function Message(payload) {
  this._type = 'message';
  this._payload = payload || {};
  this._context = new MessageContext();
}

module.exports = Message;

Message.validate = function(message) {
  return message &&
    'type' in (typeof message.toJSON === 'function' ? message.toJSON() : message);
};

Message.fromRaw = function(raw) {
  if(!Message.validate(raw)) {
    return null;
  }
  return new Message(raw.payload);
};

var p = Message.prototype;

p.getType = function() {
  return this._type;
};

p.getPayload = function() {
  return this._payload;
};

p.getContext = function() {
  return this._context;
};

p.toJSON = function() {
  return {
    type: this.getType(),
    payload: this.getPayload()
  };
};

function MessageContext() {
  this._attributes = {};
}

MessageContext.prototype.del = function(key) {
  delete this._attributes[key];
};

MessageContext.prototype.get = function(key) {
  return this._attributes[key];
};

MessageContext.prototype.has = function(key) {
  return key in this._attributes;
};

MessageContext.prototype.getAll = function() {
  return this._attributes;
};

MessageContext.prototype.set = function(key, value) {
  if(arguments.length === 1) {
    _.merge(this._attributes, key);
  } else if(arguments.length === 2) {
    this._attributes[key] = value;
  }
  return this;
};

MessageContext.prototype.toJSON = function() {
  return this.getAll();
};

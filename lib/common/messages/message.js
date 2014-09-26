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

Message.hydrate = function(raw) {

  if(!Message.validate(raw)) {
    return null;
  }

  var message = new Message(raw.payload);

  message.setPayload(raw.payload || {});

  Message.populate(message, raw);

  return message;
};

Message.populate = function(message, raw) {
  if(Array.isArray(raw.recipients)) {
    message.setRecipients(raw.recipients);
  }
  message.setSender(raw.sender);
  message.setScope(raw.scope);
};

var p = Message.prototype;

p.getType = function() {
  return this._type;
};

p.getSender = function() {
  return this.getContext().getSender();
};

p.setSender = function(sender) {
  this.getContext().setSender(sender);
  return this;
};

p.getScope = function() {
  return this.getContext().getScope();
};

p.setScope = function(scope) {
  this.getContext().setScope(scope);
  return this;
};

p.getRecipients = function() {
  return this.getContext().getRecipients();
};

p.setRecipients = function(recipients) {
  this.getContext().setRecipients(recipients);
  return this;
};

p.hasRecipient = function(recipient) {
  return this.getContext().hasRecipient(recipient);
};

p.addRecipient = function(recipient) {
  this.getContext().addRecipient(recipient);
  return this;
};

p.getPayload = function() {
  return this._payload;
};

p.setPayload = function(payload) {
  this._payload = payload;
  return this;
};

p.getContext = function() {
  return this._context;
};

p.toJSON = function() {
  return {
    type: this.getType(),
    payload: this.getPayload(),
    recipients: this.getRecipients(),
    sender: this.getSender(),
    scope: this.getScope()
  };
};

function MessageContext() {
  this._attributes = {};
  this._recipients = [];
  this._sender = null;
  this._scope = null;
}

p = MessageContext.prototype;

p.getSender = function() {
  return this._sender;
};

p.setSender = function(sender) {
  this._sender = sender;
  return this;
};

p.getScope = function() {
  return this._scope;
};

p.setScope = function(scope) {
  this._scope = scope;
  return this;
};

p.getRecipients = function() {
  return this._recipients;
};

p.setRecipients = function(recipients) {
  if(recipients && !Array.isArray(recipients)) {
    throw new Error('Recipients must be an array !');
  }
  this._recipients = recipients;
  return this;
};

p.hasRecipient = function(recipient) {
  return this._recipients.indexOf(recipient) !== -1;
};

p.addRecipient = function(recipient) {
  this._recipients.push(recipient);
  return this;
};

p.del = function(key) {
  delete this._attributes[key];
};

p.get = function(key) {
  return this._attributes[key];
};

p.has = function(key) {
  return key in this._attributes;
};

p.getAll = function() {
  return this._attributes;
};

p.set = function(key, value) {
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

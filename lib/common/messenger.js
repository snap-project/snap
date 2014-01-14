var Duplex = require('stream').Duplex;
var util = require('util');
var Message = require('./message');
var Call = require('./messages/call');
var Response = require('./messages/response');
var slice = Array.prototype.slice;

function Messenger() {
  Duplex.call(this, {objectMode: true});
  this._messagesQueue = [];
  this._handlers = {};
  this._initDefaultHandler();
}

// Expose messages constructors
Messenger.Message = Message;

util.inherits(Messenger, Duplex);

module.exports = Messenger;

var p = Messenger.prototype;

p.send = function(message) {
  var isValid = Message.validate(message);
  if(isValid) {
    this._enqueue(message);
  }
  return this;
};

p._enqueue = function(message) {
  this._messagesQueue.push(message);
  this._read();
};

p._read = function() {
  var message;
  var queue = this._messagesQueue;
  var keepPushing = true;
  while(queue.length > 0 && keepPushing) {
    message = queue.shift();
    keepPushing = this.push(message);
  }
};

p._write = function(message, encoding, cb) {
  var isValid = Message.validate(message);
  if(isValid) {
    this._dispatchMessage(message);
  }
  return cb();
};

p._dispatchMessage = function(message) {
  var handler = this._handlers[message.type];
  if(typeof handler === 'function') {
    handler(message);
  } else {
    this.emit('error', new Error('Unknown message type !'));
  }
};

p._initDefaultHandler = function() {
  var self = this;
  self._handlers['message'] = function(message) {
    self.emit('message', message);
  };
};
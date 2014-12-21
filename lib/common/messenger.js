/* jshint node: true, browser: true */
var Duplex = require('stream').Duplex;
var util = require('util');
var Message = require('./messages').Message;

function Messenger() {
  Duplex.call(this, {objectMode: true});
  this._messageQueue = [];
  this._messageHandlers = {};
  this._addMessageHandler('message', this._handleMessage);
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

p._addMessageHandler = function(messageType, handler) {
  this._messageHandlers[messageType] = handler;
};

p._enqueue = function(message) {
  this._messageQueue.push(message);
  this._read();
};

p._read = function() {
  var message;
  var queue = this._messageQueue;
  var keepPushing = true;
  while(queue.length > 0 && keepPushing) {
    message = queue.shift();
    keepPushing = this.push(message);
  }
};

p._write = function(data, encoding, cb) {

  if(!(data instanceof Message)) {
    return cb(new Error('data is not a valid Message instance !'));
  }

  var handler = this._messageHandlers[data.getType()];

  if(typeof handler !== 'function') {
    return cb(new Error('No handler configured for "' + data.getType() + '" messages !'));
  }

  try {
    handler.call(this, data);
  } catch(err) {
    return cb(err);
  }

  return cb();

};

p._handleMessage = function(message) {
  this.emit('message', message);
}

/* jshint node: true, browser: true */
var Duplex = require('stream').Duplex;
var util = require('util');
var Message = require('./message');

function Messenger() {
  Duplex.call(this, {objectMode: true});
  this._messageQueue = [];
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

  var message = Message.hydrate(data);

  if(!(message instanceof Message)) {
    return cb(new Error('data is not a valid message !'));
  }

  this.emit('message', message);

  return cb();

};

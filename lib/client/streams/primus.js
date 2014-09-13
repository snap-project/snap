/* jshint node: true, browser: true */
/* global Primus */
var util = require('util');
var Duplex = require('stream').Duplex;

// PrimusStream constructor
function PrimusStream(endpointUrl) {
  Duplex.call(this, {objectMode: true});
  this._messagesQueue = [];
  this._primus = Primus.connect(endpointUrl, {});
  this._primus.on('data', this._enqueue.bind(this));
}

util.inherits(PrimusStream, Duplex);

// expose PrimusStream class
module.exports = PrimusStream;

// Create convenience alias
var p = PrimusStream.prototype;

p._write = function(message, encoding, cb) {
  try {
    this._primus.write(message);
    return cb();
  } catch(err) {
    return cb(err);
  }
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

p._enqueue = function(message) {
  this._messagesQueue.push(message);
  this._read();
};

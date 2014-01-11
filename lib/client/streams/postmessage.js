var helpers = require('../helpers');
var util = require('util');
var Duplex = require('stream').Duplex;

// PostMessageStream constructor
function PostMessageStream(windowTarget) {

  this._target = windowTarget;

  Duplex.call(this, {objectMode: true});

  var supportPostMessage = helpers.supportPostMessage();

  if(!supportPostMessage) {
    throw new Error('No postMessage support or not in a browser !');
  }
  this._messagesQueue = [];
  this._initListeners();
}

util.inherits(PostMessageStream, Duplex);

// expose PostMessageStream class
module.exports = PostMessageStream;

// Create convenience alias
var p = PostMessageStream.prototype;

p._write = function(message, encoding, cb) {
  try {
    var json = typeof message.toJSON === 'function' ? message.toJSON() : message;
    var raw = JSON.stringify(json);
    this._target.postMessage(raw, '*');
    return cb();
  } catch(err) {  
    return cb(err);
  }
};

p._read = function(size) {
  var message;
  var queue = this._messagesQueue;
  var keepPushing = true;
  while(queue.length > 0 && keepPushing) {
    message = queue.shift();
    keepPushing = this.push(message);
  }
};

p._initListeners = function() {
  global.window.onmessage = this._handleMessage.bind(this);
};

p._handleMessage = function(evt) {
  var message;
  try {
    message = JSON.parse(evt.data);
  } catch(err) { /* Ignore invalid message */ }
  if(message) {
    this._enqueue(message);
  }
};

p._enqueue = function(message) {
  this._messagesQueue.push(message);
  this._read();
};
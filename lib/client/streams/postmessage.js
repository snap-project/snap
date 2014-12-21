/* jshint node: true, browser: true */
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
  this._handleMessageBound = this._handleMessage.bind(this);
  this._initListeners();
  this.once('unpipe', this._clear.bind(this));
}

util.inherits(PostMessageStream, Duplex);

// expose PostMessageStream class
module.exports = PostMessageStream;

// Create convenience alias
var p = PostMessageStream.prototype;

p._write = function(message, encoding, cb) {
  try {
    var raw = JSON.stringify(message);
    this._target.postMessage(raw, '*');
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

p._initListeners = function() {
  window.addEventListener('message', this._handleMessageBound, false);
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

p._clear = function() {
  window.removeEventListener('message', this._handleMessageBound);
  this._target = null;
  this.removeAllListeners();
};

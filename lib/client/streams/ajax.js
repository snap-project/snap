/* jshint node: true, browser: true */
/* global EventSource */
var util = require('util');
var Duplex = require('stream').Duplex;

// AJAXStream constructor
function AJAXStream(endpointURL) {
  Duplex.call(this, {objectMode: true});
  this._endpointURL = endpointURL;
  this._messagesQueue = [];
  this._handleSSEBound = this._handleSSE.bind(this);
  this._initEventSource();
  this.on('unpipe', this._clear.bind(this));
}

util.inherits(AJAXStream, Duplex);

// expose AJAXStream class
module.exports = AJAXStream;

// Create convenience alias
var p = AJAXStream.prototype;

p._write = function(message, encoding, cb) {
  try {
    this._send(message);
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

p._send = function(message) {
  var self = this;
  var url = self._endpointURL;
  self.emit('send', message);
  $.ajax({
    type: 'POST',
    url: url, 
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function(message) {
      self.emit('complete', message);
      if(message) {
        self._enqueue(message);
      }
    }
  });
};

p._enqueue = function(message) {
  this._messagesQueue.push(message);
  this._read();
};

p._initEventSource = function() {
  var eventSource = this._eventSource = new EventSource(this._endpointURL);
  eventSource.addEventListener('message', this._handleSSEBound, false);
};

p._handleSSE = function(evt) {
  var message;
  try {
    message = JSON.parse(evt.data);
  } catch(err) { /* Ignore invalid message */ }
  if(message) {
    this._enqueue(message);
  }
};

p._clear = function() {
  if(this._eventSource) {
    this._eventSource.removeEventListener('message', this._handleSSEBound);
    this._eventSource.close();
  }
  this.removeAllListeners();
};
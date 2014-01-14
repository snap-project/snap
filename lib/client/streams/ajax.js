var util = require('util');
var Duplex = require('stream').Duplex;

// AJAXStream constructor
function AJAXStream(endpointURL) {
  Duplex.call(this, {objectMode: true});
  this._endpointURL = endpointURL;
  this._messagesQueue = [];
  this._handleResponseBinded = this._handleResponse.bind(this);
  this._initEventSource();
}

util.inherits(AJAXStream, Duplex);

// expose AJAXStream class
module.exports = AJAXStream;

// Create convenience alias
var p = AJAXStream.prototype;

p._write = function(obj, encoding, cb) {
  try {
    var message = typeof obj.toJSON === 'function' ? obj.toJSON() : obj;
    this._send(message);
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

p._send = function(message) {
  var req = new XMLHttpRequest();
  req.open("POST", this._endpointURL, true);
  req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  req.onreadystatechange = this._handleResponseBinded;
  req.send(JSON.stringify(message));
};

p._handleResponse = function(evt) {
  var message;
  var req = evt.target;
  if(req.readyState === 4) {
    if(req.status >= 200 && req.status < 400) {
      try {
        message = JSON.parse(evt.responseText);
      } catch(err) { /* Ignore invalid message */ };
      if(message) {
        this._enqueue(message);
      }
    }
  }
};

p._enqueue = function(message) {
  this._messagesQueue.push(message);
  this._read();
};

p._initEventSource = function() {
  var eventSource = this._eventSource = new EventSource(this._endpointURL);
  eventSource.addEventListener('message', this._handleSSE.bind(this));
};

p._handleSSE = function(evt) {
  var message;
   try {
    message = JSON.parse(evt.data);
  } catch(err) { /* Ignore invalid message */ };
  if(message) {
    this._enqueue(message);
  }
};
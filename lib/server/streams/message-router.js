var util = require('util');
var Writable = require('stream').Writable;
var SSEStream = require('./sse');

// MessageRouterStream constructor
function MessageRouterStream() {
  Writable.call(this, {objectMode: true});
  this._streams = {};
}

util.inherits(MessageRouterStream, Writable);

// expose MessageRouterStream class
module.exports = MessageRouterStream;

// Create convenience alias
var p = MessageRouterStream.prototype;

p._write = function(message, encoding, cb) {
  try {
    var sessionID = message.meta.session.id;
    var stream = this.getSSEStream(sessionID);
    stream.write(message);
  } catch(err) {
    return cb(err);
  }
  return cb();
};

p.getSSEStream = function(sessionID) {
  var stream = this._streams[sessionID];
  if(!stream) {
    this._streams[sessionID] = stream = new SSEStream();
  }
  return stream;
};




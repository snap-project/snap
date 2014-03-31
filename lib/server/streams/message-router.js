/* jshint node: true */
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

p.getSSEStream = function(userId) {
  var stream = this._streams[userId];
  if(!stream) {
    this._streams[userId] = stream = new SSEStream();
  }
  return stream;
};

p._write = function(message, encoding, cb) {
  try {
    var userId = message.meta.user.id;
    var stream = this.getSSEStream(userId);
    stream.write(message);
  } catch(err) {
    return cb(err);
  }
  return cb();
};






/* jshint node: true */
var util = require('util');
var Transform = require('stream').Transform;

function SSEStream() {
  Transform.call(this, {objectMode: true});
}

util.inherits(SSEStream, Transform);

module.exports = SSEStream;

var p = SSEStream.prototype;

p._transform = function(message, encoding, cb) {
  var evt = 'event: message\n';
  try {
    evt += 'data: ' + JSON.stringify(message) + '\n\n';
  } catch(err) {
    return cb(err);
  }
  this.push(evt, 'utf8');
  return cb();
};
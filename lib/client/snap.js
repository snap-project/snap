var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Snap() {
  EventEmitter.call(this);
}

util.inherits(Snap, EventEmitter);

module.exports = Snap;

var p = Snap.prototype;

p.ready = function(cb) {
  
};
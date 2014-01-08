
var EventEmitter = require('events').EventEmitter;
var util = require('util');

// Supervisor constructor
function Supervisor() {
  EventEmitter.call(this);
}

// Extend EventEmitter
util.inherits(Supervisor, EventEmitter);

// expose Supervisor class
module.exports = Supervisor;

// Create convenience alias
var p = Supervisor.prototype;




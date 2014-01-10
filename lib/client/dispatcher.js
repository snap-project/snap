var helpers = require('./helpers');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Dispatcher() {
  EventEmitter.call(this);
}

// Extend EventEmitter
util.inherits(Dispatcher, EventEmitter);

// expose Dispatcher class
module.exports = Dispatcher;

// Create convenience alias
var p = Dispatcher.prototype;

p.handle = function(evt) {
  var message;
  try {
    message = JSON.parse(evt.data);
  } catch(err) {
    this.emit('error', new Error('Message is not a valid JSON !'));
    return;
  }
  var isValid = helpers.validateMessage(message);
  if(isValid) {
    return this.emit(message.type, message);
  } else {
    this.emit('error', new Error('Invalid message format !'));
  }
};

p.validate = function(message) {
  return true;
};






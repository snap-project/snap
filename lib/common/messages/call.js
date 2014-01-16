/* jshint node: true, browser: true */
var Message = require('../message');
var util = require('util');
var uuid = require('node-uuid');

var slice = Array.prototype.slice;

function Call(namespace, method, needResponse) {
  Message.call(this);
  this.type = 'call';
  this.namespace = namespace;
  this.method = method;
  if(needResponse) {
    this.id = uuid.v4();
  }
}

util.inherits(Call, Message);

module.exports = Call;

var p = Call.prototype;

p.addParams = function() {
  this.params = (this.params || []).concat(slice.call(arguments));
};
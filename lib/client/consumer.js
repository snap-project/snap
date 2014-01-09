var helpers = require('./helpers');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var slice = Array.prototype.slice;
var window = global.window;

function Consumer() {
  EventEmitter.call(this);
  this._dispatcher = {};
  this._pendingResponses = {};
}

util.inherits(Consumer, EventEmitter);

// Expose Consumer as module
module.exports = Consumer;

// Convenience alias
var p = Consumer.prototype;

p.ready = function(cb) {

  // Do we have a callback ?
  if(typeof cb !== 'function') {
    throw new Error('Invalid argument !');
  }
  
  // Are we in a frame ?
  if(!helpers.isFrame()) {
    return cb(new Error('Not in a frame !'));
  }

  // Does browser support inter-frame messaging ?
  if(!helpers.supportPostMessage()) {
    return cb(new Error('No postMessage support !'));
  }

  // Start listening for messages
  window.addEventListener('message', this._handleMessage.bind(this), false);

  // Ok, here we go
  this.call('ready', function(err, result) {
    if(err) {
      return cb(err);
    }
    var sandboxInfo = result[0];
    var sandbox = createSandbox(sandboxInfo);
    return cb(null, sandbox);
  });

};

// Call a method on parent supervisor via postMessage
p.call = function(method, params, cb) {

  cb = arguments[arguments.length-1];
  var isNotification = !(typeof cb === 'function')

  params = slice.call(
    arguments,
    1,
    isNotification ? arguments.length : arguments.length-1
  );

  var parent = window.parent;

  var message = {
    type: 'call',
    params: params,
    method: method
  };

  if(!isNotification) {
    var id = Date.now();
    message.id = id;
    pendingResponses[id] = cb;
  }

  var origin = window.location.origin;
  parent.postMessage(JSON.stringify(message), origin);

  return this;

};

p.validateMessage = function(message) {
  return true;
};

p._handleMessage = function(evt) {
  console.log('Parent origin', evt.origin)
  var message;
  try {
    message = JSON.parse(evt.data);
  } catch(err) {
    // Just return, ignore the invalid message
    return;
  }
  var isValid = this.validateMessage(message);
  var dispatcher = this._dispatcher;
  if(isValid && typeof dispatcher[message.type] === 'function') {
    dispatcher[message.type](message);
  }
};

p._createSandbox = function(sandboxInfo) {
  var sandbox = {};
  Object
    .keys(sandboxInfo)
    .forEach(function(namespace) {
      var holder = sandbox[namespace] = {};
      var nsMethods = sandboxInfo[namespace];
      nsMethods.forEach(getMethodProxy.bind(holder, namespace));
    });
  return sandbox;
};

p._getMethodProxy = function(namespace, methodName) {
  this[methodName] = call.bind(null, namespace + ':' + methodName);
};
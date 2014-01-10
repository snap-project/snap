var helpers = require('./helpers');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Dispatcher = require('./dispatcher');
var ResponseHandler = require('./handlers/response');
var window = global.window;

function Consumer() {
  EventEmitter.call(this);
  this._initDispatcher();
  this.registerHandler('response', );
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

  // Ok, here we go
  this.call('getSandboxInfo', function(err, sandbox) {
    if(err) {
      return cb(err);
    }
    var sandbox = createSandbox(sandboxInfo);
    return cb(null, sandbox);
  });

};


p.addMessageHandler = function(handler) {

  var that = this;

  var messageTypes;
  if( Array.isArray(handler.messageTypes) ) {
    messageTypes = handler.messageTypes;
  } else {
    messageTypes = [handler.messageTypes];
  }

  messageTypes.forEach(function(type) {
    that._dispatcher.on(type, handler.handle.bind(that));
  });

  return this;
  
};

p.validate = helpers.validateMessage;

p.send = function(message) {
  var isValid = this.validate(message);
  if(isValid) {
    var parent = window.parent;
    var origin = window.location.origin;
    parent.postMessage(JSON.stringify(message), origin);
  } else {
    throw new Error('Invalid message format !');
  }
};

p._initDispatcher = function() {
  // Create message dispatcher
  var dispatcher = new Dispatcher();
  // Start listening for messages
  window.addEventListener('message', dispatcher.handle.bind(dispatcher));
  // Save dispatcher ref
  this._dispatcher = dispatcher;
};

p._initDefaultHandlers = function() {

  // Init cross frame call handler
  var xFrameCallHandler = new XFrameCallHandler();
  this.addHandler(xFrameCallHandler);
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
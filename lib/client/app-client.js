/* jshint node: true, browser: true */
var RPC = require('../common/rpc').RPC;
var EventEmitter = require('events').EventEmitter;
var PostMessageStream = require('./streams/postmessage');
var helpers = require('./helpers');
var _ = require('lodash');
var util = require('util');

// AppClient constructor
function AppClient(rpc) {

  this._rpc = rpc || new RPC();
  this._messagesBuffer = [];

  var isFrame = helpers.isFrame();
  if(!isFrame) {
    throw new Error('Not in a frame !');
  }

  this._initListeners();
  this._initPipeline();

}

util.inherits(AppClient, EventEmitter);

// expose AppClient class
module.exports = AppClient;

// Create convenience alias
var p = AppClient.prototype;

p.ready = function(cb) {

  // Do we have a callback ?
  if(typeof cb !== 'function') {
    throw new Error('First argument must be a callback !');
  }

  // Defer call
  _.defer(_.bind(function() {
    this._rpc.getRemoteDescriptor(_.bind(onDescriptorReceived, this));
  }, this));

  return this;

  function onDescriptorReceived(err, descriptor) {
    if(err) {
      return cb(err);
    }
    var services = this._services = this._createServices(descriptor);
    this._dispatchBufferedMessages();
    return cb(null, services);
  }

};

p._initListeners = function() {
  this._rpc.on('message', _.bind(this._handleMessage, this));
};

p._initPipeline = function() {

  var pmStream = new PostMessageStream(global.window.parent);

  var messenger = this._rpc.getMessenger();

  messenger.pipe(pmStream).pipe(messenger);

};

p._createServices = function(descriptor) {

  var services = new EventEmitter();

  _.forEach(descriptor, function(nsMethods, namespace) {

    var rpc = this._rpc;
    var holder = services[namespace] = new EventEmitter();

    _.forEach(nsMethods, function(method) {
      holder[method] = _.bind(rpc.call, rpc, namespace, method);
    }, this);

  }, this);

  return services;

};

p._handleMessage = function(message) {

  var services = this._services;

  if(services) {
    var type = message.getType();
    var service = _.find(services, function(s, namespace) {
      if(type.indexOf(namespace) === 0) {
        return true;
      }
    });
    if(service) {
      service.emit(type, message);
    }
    this.emit('message', message);
  } else {
    // Not yet ready, buffer message
    this._messagesBuffer.push(message);
  }

};

p._dispatchBufferedMessages = function() {
  var messagesBuffer = this._messagesBuffer;
  var message;
  while(!!(message = messagesBuffer.shift())) {
    _.defer(_.bind(this._handleMessage, this, message));
  }
};

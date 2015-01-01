/* jshint node: true, browser: true */
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var RPC = require('../common/rpc').RPC;
var PostMessageStream = require('./streams/postmessage');
var PrimusStream = require('./streams/primus');
var through = require('through');
var _ = require('lodash');

// Supervisor constructor
function Supervisor(frameContainer) {
  this._frameContainer = frameContainer;
  this.server = new RPC();
  this.client = new RPC();
  this._initListeners();
  this._initServerRPC();
  this._messageForward = {};
}

util.inherits(Supervisor, EventEmitter);

// expose Supervisor class
module.exports = Supervisor;

// Create convenience alias
var p = Supervisor.prototype;

p.loadApp = function(appName) {
  var currentApp = this.getCurrentApp();
  if(appName && appName !== currentApp) {
    window.location.hash =  '#/' + appName;
  } else {
    this._loadApp(appName);
  }
};

p.getCurrentApp = function() {
  return window.location.hash.slice(2);
};

// "proxy" RPC calls between Apps & Server
p.proxy = function(namespace, method, hookFunc) {

  this.client.expose(namespace, method, _.bind(handleRPCResponse, this));
  return this;

  function handleRPCResponse(params, cb) {

    var args = [namespace, method];

    args.push.apply(args, params || []);
    args.push(cb);

    if(typeof hookFunc === 'function') {
      hookFunc.call(this, args);
    }

    return this.server.call.apply(this.server, args);

  }

};

// "Forward" downstream messages of the given type to Apps
p.forward = function(messageType) {
  this._messageForward[messageType] = true;
  return this;
};

p.unforward = function(messageType) {
  delete this._messageForward[messageType];
  return this;
};

p._resetClientRPC = function() {

  var messenger = this.client.getMessenger();

  // Cleaning messenger listeners
  messenger.removeAllListeners(); // (will detach client RPC to its messenger)
  messenger.unpipe();

  // Reattach client RPC to its messenger
  this.client.attachTo(messenger);

  var frameWindow = this._appFrame.contentWindow;

  var pmStream = new PostMessageStream(frameWindow);

  messenger.pipe(pmStream).pipe(messenger);

};

p._initServerRPC = function() {

  var self = this;
  var primusStream = new PrimusStream('rpc');

  primusStream.on('send', _.bind(this.emit, this, 'start-working'));
  primusStream.on('complete', _.bind(this.emit, this, 'stop-working'));

  var messenger = this.server.getMessenger();

  messenger.pipe(through(downstreamFilter))
    .pipe(primusStream)
    .pipe(through(upstreamFilter))
    .pipe(messenger);

  this.server.on('message', _.bind(this._handleMessageForwarding, this));

  function downstreamFilter(message) {
    message.set('currentApp', self.getCurrentApp(), false);
    this.queue(message);
  }

  function upstreamFilter(message) {
    var currentApp = self.getCurrentApp();
    if(message && (message.context || {}).currentApp === currentApp) {
      this.queue(message);
    }
  }

};

p._createAppFrame = function() {
  var frame = document.createElement('iframe');
  frame.sandbox = 'allow-scripts allow-forms';
  return frame;
};

p._loadApp = function(appName) {
  var self = this;
  var container = self._frameContainer;
  container.classList.add('app-loading');
  var frame = this._appFrame = self._createAppFrame();
  self.emit('start-working');
  frame.onload = function() {
    self.emit('stop-working');
    self._resetClientRPC();
    container.classList.remove('app-loading');
  };
  frame.src = 'apps/' + (appName ? appName + '/' : '');
  while(container.lastChild) {
    container.removeChild(container.lastChild);
  }
  this._frameContainer.appendChild(frame);
};

p._initListeners = function() {
  var hashChangeListener = this._hashChangeHandler.bind(this);
  window.addEventListener('hashchange', hashChangeListener, false);
  this.client.on('error', this._handleErrors.bind(this));
  this.server.on('error', this._handleErrors.bind(this));
};

p._handleMessageForwarding = function(message) {
  var type = message.getType();
  if(type in this._messageForward) {
    this.client.getMessenger().send(message);
  }
};

p._hashChangeHandler = function() {
  var appName = location.hash.slice(2);
  this._loadApp(appName);
};

// "Handle" errors...
p._handleErrors = function(err) {
  console.error(err);
};

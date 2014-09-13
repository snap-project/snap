/* jshint node: true, browser: true */
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var RPC = require('../common/rpc');
var PostMessageStream = require('./streams/postmessage');
var PrimusStream = require('./streams/primus');
var Path = global.window.Path;

// Supervisor constructor
function Supervisor(frameContainer) {
  this._frameContainer = frameContainer;
  this._initListeners();
  this.server = new RPC();
  this.client = new RPC();
  this._initServerRPC();
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

p.bridge = function(namespace, method, hookFunc) {
  var self = this;
  self.client.expose(namespace, method, function(params, cb) {
    var args = [namespace, method];
    args.push.apply(args, params || []);
    args.push(cb);
    if(typeof hookFunc === 'function') {
      hookFunc.call(self, args);
    }
    return self.server.call.apply(self.server, args);
  });
  return self;
};

p._resetClientRPC = function() {
  this.client.unpipe();
  var frameWindow = this._appFrame.contentWindow;
  var pmStream = new PostMessageStream(frameWindow);
  // TODO proper error handling
  pmStream.on('error', console.error.bind(console));
  this.client.pipe(pmStream).pipe(this.client);
};

p._initServerRPC = function() {
  var stream = new PrimusStream('rpc');
  stream.on('send', this.emit.bind(this, 'start-working'));
  stream.on('complete', this.emit.bind(this, 'stop-working'));
  // TODO proper error handling
  stream.on('error', console.error.bind(console));
  this.server.pipe(stream).pipe(this.server);
};

p._createAppFrame = function() {
  var frame = document.createElement('iframe');
  frame.setAttribute('seamless', 'true');
  frame.sandbox = 'allow-scripts allow-forms';
  return frame;
};

p._loadApp = function(appName) {
  var self = this;
  var container = self._frameContainer;
  var frame = this._appFrame = self._createAppFrame();
  self.emit('start-working');
  frame.onload = function() {
    self.emit('stop-working');
    self._resetClientRPC();
  };
  frame.src = 'apps/' + (appName ? appName + '/' : '');
  while(container.lastChild) {
    container.removeChild(container.lastChild);
  }
  this._frameContainer.appendChild(frame);
};

p._initListeners = function() {
  window.addEventListener('hashchange', this._hashChangeHandler.bind(this), false);
};

p._hashChangeHandler = function() {
  var appName = location.hash.slice(2);
  this._loadApp(appName);
};

/* jshint node: true, browser: true */
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var RPC = require('../common/rpc');
var RawMessageHydrator = require('../common/transformers/raw-message-hydrator');
var PostMessageStream = require('./streams/postmessage');
var PrimusStream = require('./streams/primus');
var through = require('through');

// Supervisor constructor
function Supervisor(frameContainer) {
  this._frameContainer = frameContainer;
  this.server = new RPC();
  this.client = new RPC();
  this.server._id = this.client._id = 'supervisor';
  this._initListeners();
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
  this.client.removeAllListeners();

  var hydratorStream = RawMessageHydrator.factory();

  var frameWindow = this._appFrame.contentWindow;

  var pmStream = new PostMessageStream(frameWindow);

  this.client.pipe(pmStream)
    .pipe(hydratorStream)
    .pipe(this.client);

  // Forward messages
  this.client.on('message', forward.bind(this.server));

};

p._initServerRPC = function() {

  var primusStream = new PrimusStream('rpc');

  primusStream.on('send', this.emit.bind(this, 'start-working'));
  primusStream.on('complete', this.emit.bind(this, 'stop-working'));

  var hydratorStream = RawMessageHydrator.factory();

  var self = this;
  this.server.pipe(through(function(message) {
      message.set('currentApp', self.getCurrentApp(), false);
      this.queue(message);
    }))
    .pipe(primusStream)
    .pipe(hydratorStream)
    .pipe(through(function(message) {
      if(message.get('currentApp') === self.getCurrentApp()) {
        this.queue(message);
      }
    }))
    .pipe(this.server);

  // Forward messages
  this.server.on('message', forward.bind(this.client));

};

function forward(message) {
  this.send(message);
}

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
  var hashChangeListener = this._hashChangeHandler.bind(this);
  window.addEventListener('hashchange', hashChangeListener, false);
  this.client.on('error', this._handleErrors.bind(this));
  this.server.on('error', this._handleErrors.bind(this));
};

p._hashChangeHandler = function() {
  var appName = location.hash.slice(2);
  this._loadApp(appName);
};

// "Handle" errors...
p._handleErrors = function(err) {
  console.error(err);
};

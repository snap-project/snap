/* jshint node: true, browser: true */
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var RPC = require('../common/rpc');
var PostMessageStream = require('./streams/postmessage');
var AJAXStream = require('./streams/ajax');

// Supervisor constructor
function Supervisor(frame) {
  this._appFrame = frame;
  this._resetClientRPC();
  this._resetServerRPC();
}

util.inherits(Supervisor, EventEmitter);

// expose Supervisor class
module.exports = Supervisor;

// Create convenience alias
var p = Supervisor.prototype;

p.loadApp = function(appName) {
  var self = this;
  self.emit('start-working');
  self._appFrame.onload = function() {
    self.emit('stop-working');
    self._resetClientRPC();
  };
  self._appFrame.src = 'apps/' + (appName ? appName + '/' : '');
  this._currentApp = appName;
};

p.getCurrentApp = function() {
  return this._currentApp;
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
  var client = this.client = this.client || new RPC();
  client.id = 'supervisor client';
  client.unpipe();
  var frameWindow = this._appFrame.contentWindow;
  var pmStream = new PostMessageStream(frameWindow);
  // TODO proper error handling
  pmStream.on('error', console.error.bind(console));
  client.pipe(pmStream).pipe(client);
};

p._resetServerRPC = function() {
  var server = this.server = this.server || new RPC();
  server.id = 'supervisor server';
  server.unpipe();
  var ajaxStream = new AJAXStream('rpc');
  ajaxStream.on('send', this.emit.bind(this, 'start-working'));
  ajaxStream.on('complete', this.emit.bind(this, 'stop-working'));
  // TODO proper error handling
  ajaxStream.on('error', console.error.bind(console));
  server.pipe(ajaxStream).pipe(server);
};



/* jshint node: true, browser: true */
var RPC = require('../common/rpc');
var PostMessageStream = require('./streams/postmessage');
var AJAXStream = require('./streams/ajax');

// Supervisor constructor
function Supervisor(frame) {
  this._appFrame = frame;
  this._resetClientRPC();
  this._resetServerRPC();
}

// expose Supervisor class
module.exports = Supervisor;

// Create convenience alias
var p = Supervisor.prototype;

p.loadApp = function(appName) {
  this._appFrame.onload = this._resetClientRPC.bind(this);
  this._appFrame.src = 'apps/' + (appName ? appName + '/' : '');
};

p.bridge = function(namespace, method) {
  var self = this;
  self.client.expose(namespace, method, function(params, cb) {
    var args = [namespace, method];
    args.push.apply(args, params || []);
    args.push(cb);
    return self.server.call.apply(self.server, args);
  });
  return self;
};

p._resetClientRPC = function() {
  var client = this.client = this.client || new RPC();
  client.unpipe();
  var frameWindow = this._appFrame.contentWindow;
  var pmStream = new PostMessageStream(frameWindow);
  // TODO proper error handling
  pmStream.on('error', console.error.bind(console));
  client.pipe(pmStream).pipe(client);
};

p._resetServerRPC = function() {
  var server = this.server = this.server || new RPC();
  server.unpipe();
  var ajaxStream = new AJAXStream('rpc');
  // TODO proper error handling
  ajaxStream.on('error', console.error.bind(console));
  server.pipe(ajaxStream).pipe(server);
};



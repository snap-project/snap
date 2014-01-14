var RPC = require('../common/rpc');
var PostMessageStream = require('./streams/postmessage');
var AJAXStream = require('./streams/ajax');

var Message = require('../common/message');

// Supervisor constructor
function Supervisor(frame) {
  this._appFrame = frame;
  this._resetAppRPC();
  this._resetServerRPC();
}

// expose Supervisor class
module.exports = Supervisor;

// Create convenience alias
var p = Supervisor.prototype;

p.loadApp = function(appName) {
  this._appFrame.onload = this._resetAppRPC.bind(this);
  this._appFrame.src = 'apps/' + (appName ? appName + '/' : '');
};

p.bridge = function(namespace, method) {
  var self = this;
  self.app.expose(namespace, method, function(params, cb) {
    var args = [namespace, method];
    args.push.apply(args, params || []);
    args.push(cb);
    return self.server.call.apply(self.server, args);
  });
  return self;
};

p._resetAppRPC = function() {
  var app = this.app = this.app || new RPC();
  app.unpipe();
  var frameWindow = this._appFrame.contentWindow;
  var pmStream = new PostMessageStream(frameWindow);
  pmStream.on('error', console.error.bind(console)); // TODO proper error handling
  app.pipe(pmStream).pipe(app);
};

p._resetServerRPC = function() {
  var server = this.server = this.server || new RPC();
  server.unpipe();
  var ajaxStream = new AJAXStream('rpc');
  ajaxStream.on('error', console.error.bind(console)); // TODO proper error handling
  server.pipe(ajaxStream).pipe(server);
};



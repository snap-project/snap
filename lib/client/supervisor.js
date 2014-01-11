var Communicator = require('../common/communicator');
var PostMessageStream = require('./streams/postmessage');

var Message = require('../common/message');

// Supervisor constructor
function Supervisor(frame) {
  this._appFrame = frame;
  this._initAppRPC();
  this._initServerRPC();
}

// expose Supervisor class
module.exports = Supervisor;

// Create convenience alias
var p = Supervisor.prototype;

p.loadApp = function(appName) {
  this._appFrame.onload = this._initAppRPC.bind(this);
  this._appFrame.src = 'apps/' + (appName ? appName + '/' : '');
};

p._initAppRPC = function() {
  var app = this.app = new Communicator();
  var frameWindow = this._appFrame.contentWindow;
  var pmStream = new PostMessageStream(frameWindow);
  pmStream.name = 'Supervisor';
  pmStream.on('error', console.error.bind(console));
  app.pipe(pmStream).pipe(app);
};

p._initServerRPC = function() {
  this.server = new Communicator();
};




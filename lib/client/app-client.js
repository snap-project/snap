var util = require('util');
var RPC = require('../common/rpc');
var PostMessageStream = require('./streams/postmessage');
var helpers = require('./helpers');

// AppClient constructor
function AppClient() {

  RPC.call(this);

  var isFrame = helpers.isFrame();
  if(!isFrame) {
    throw new Error('Not in a frame !');
  }
  
  this._initPostMessageStream();

}

util.inherits(AppClient, RPC);

// expose AppClient class
module.exports = AppClient;

// Create convenience alias
var p = AppClient.prototype;

p.ready = function(cb) {

  var self = this;

  // Do we have a callback ?
  if(typeof cb !== 'function') {
    throw new Error('Invalid argument !');
  }

  self.getRemoteDescriptor(function(err, descriptor) {
    if(err) {
      return cb(err);
    }
    var sandbox = self._createSandbox(descriptor);
    return cb(null, sandbox);
  });

};

p._initPostMessageStream = function() {
  var pmStream = new PostMessageStream(global.window.parent);
  this.pipe(pmStream).pipe(this);
};

p._createSandbox = function(descriptor) {
  var self = this;
  var sandbox = {};
  Object
    .keys(descriptor)
    .forEach(function(namespace) {
      var holder = sandbox[namespace] = {};
      var nsMethods = descriptor[namespace];
      nsMethods.forEach(function(method) {
        holder[method] = self.call.bind(self, namespace, method);
      });
    });
  return sandbox;
};
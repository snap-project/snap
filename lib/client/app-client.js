/* jshint node: true, browser: true */
var util = require('util');
var RPC = require('../common/rpc');
var PostMessageStream = require('./streams/postmessage');
var RawMessageHydrator = require('../common/transformers/raw-message-hydrator');
var messages = require('../common/messages');
var helpers = require('./helpers');

// AppClient constructor
function AppClient() {

  RPC.call(this);

  this.id = 'client';

  var isFrame = helpers.isFrame();
  if(!isFrame) {
    throw new Error('Not in a frame !');
  }

  this._initPipeline();

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

p.broadcast = function(data) {
  var message = new messages.Message(data);
  this.send(message);
};

p._initPipeline = function() {

  var hydratorStream = new RawMessageHydrator();

  hydratorStream.register('message', messages.Message.hydrate);
  hydratorStream.register('call', messages.Call.hydrate);
  hydratorStream.register('response', messages.Response.hydrate);

  var pmStream = new PostMessageStream(global.window.parent);

  this.pipe(pmStream)
    .pipe(hydratorStream)
    .pipe(this);
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

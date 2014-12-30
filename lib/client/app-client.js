/* jshint node: true, browser: true */
var RPC = require('../common/rpc').RPC;
var PostMessageStream = require('./streams/postmessage');
var helpers = require('./helpers');
var _ = require('lodash');

// AppClient constructor
function AppClient() {

  this._rpc = new RPC();

  var isFrame = helpers.isFrame();
  if(!isFrame) {
    throw new Error('Not in a frame !');
  }

  this._initPipeline();

}

// expose AppClient class
module.exports = AppClient;

// Create convenience alias
var p = AppClient.prototype;

p.ready = function(cb) {

  var hasTimedOut = false;
  var hasResponded = false;

  // Do we have a callback ?
  if(typeof cb !== 'function') {
    throw new Error('First argument must be a callback !');
  }

  this._rpc.getRemoteDescriptor(_.bind(onDescriptorReceived, this));

  var timeOutId = _.delay(_.bind(onTimeOut, this), 1000);

  return this;

  function onDescriptorReceived(err, descriptor) {
    clearTimeout(timeOutId);
    if(!hasResponded) {
      hasResponded = true;
      if(err) {
        return cb(err);
      }
      var services = this._createServices(descriptor);
      return cb(null, services);
    }
  }

  function onTimeOut() {
    if(!hasTimedOut && !hasResponded) {
      hasTimedOut = true;
      this._rpc.getRemoteDescriptor(onDescriptorReceived);
    }
  }

};

p._initPipeline = function() {

  var pmStream = new PostMessageStream(global.window.parent);

  var messenger = this._rpc.getMessenger();

  messenger.pipe(pmStream).pipe(messenger);

};

p._createServices = function(descriptor) {

  var services = {};

  _.forEach(descriptor, function(nsMethods, namespace) {

    var rpc = this._rpc;
    var holder = services[namespace] = {};

    _.forEach(nsMethods, function(method) {
      holder[method] = _.bind(rpc.call, rpc, namespace, method);
    }, this);

  }, this);

  return services;
};

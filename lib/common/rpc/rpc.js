/* jshint node: true, browser: true, maxparams: 6 */
var EventEmitter = require('events').EventEmitter;
var Messenger = require('../messenger');
var Call = require('./messages').Call;
var Response = require('./messages').Response;
var errors = require('./errors');
var util = require('util');
var _ = require('lodash');

var slice = Array.prototype.slice;

function RPC(messenger) {
  this.attachTo(messenger || new Messenger());
  this._exposed = {};
  this._pendingResponses = {};
  this._initDefaultMethods();
}

RPC.RESERVED_NAMESPACE = 'rpc';

module.exports = RPC;

// Inherits from EventEmitter
util.inherits(RPC, EventEmitter);

var p = RPC.prototype;

p.attachTo = function(messenger) {
  this._messenger = messenger;
  messenger.on('message', _.bind(this._handleMessage, this));
};

p.getMessenger = function() {
  return this._messenger;
};

// call( namespace, method, [, param1, param2, ...][, cb] )
p.call = function(namespace, method, cb) {

  // Get a real arguments array
  var args = slice.call(arguments);

  // Callback is always the last argument
  cb = args[args.length-1];

  // If callback isn't present, no need to wait for a response
  var needResponse = (typeof cb === 'function');

  // Get params from arguments
  var params = args.slice(2, needResponse ? (args.length-1) : args.length);

  var call = new Call(namespace, method, needResponse);
  call.setParams(params);

  // If call need response, add callback to local map
  if(needResponse) {
    this._addPendingResponse(call.getId(), cb);
  }

  // Send call message
  this._messenger.send(call);

  return this;

};

p.expose = function(namespace, method, func) {
  var exposed = this._exposed;
  var nsHolder = exposed[namespace] = exposed[namespace] || {};
  nsHolder[method] = func;
  return this;
};

p.getRemoteDescriptor = function(cb) {
  return this.call(RPC.RESERVED_NAMESPACE, 'getDescriptor', cb);
};

p._initDefaultMethods = function() {

  this.expose(
    RPC.RESERVED_NAMESPACE,
    'getDescriptor',
    getDescriptorWrapper.bind(this)
  );

  function getDescriptorWrapper(params, cb) {
    return cb(null, this._getDescriptor());
  }

};

p._addPendingResponse = function(callID, cb) {
  this._pendingResponses[callID] = cb;
};

p._handleMessage = function(message) {

  switch(message.getType()) {

    case Call.MESSAGE_TYPE:
      var call = Call.fromMessage(message);
      if(call) {
        return this._handleCall(call);
      } else {
        this.emit('error', new errors.InvalidCall(message));
      }
      break;

    case Response.MESSAGE_TYPE:
      var response = Response.fromMessage(message);
      if(response) {
        return this._handleResponse(response);
      } else {
        this.emit('error', new errors.InvalidResponse(message));
      }
      break;

    default:
      this.emit('unknown-message', message);
      
  }

};

p._handleResponse = function(response) {

  var callID = response.getId();
  var pending = this._pendingResponses;
  var cb = pending[callID];

  if(typeof cb === 'function') {
    if(response.hasError()) {
      cb(new errors.RemoteError(response.getError()));
    } else {
      var args = [null];
      args.push.apply(args, response.getResult());
      cb.apply(null, args);
    }
  }

  delete pending[callID];

};

p._handleCall = function(call) {

  var namespace = call.getNamespace();
  var method = call.getMethod();
  var params = call.getParams() || [];
  var callID = call.getId();

  this._callLocal(
      call.getContext(),
      namespace, method,
      params,
      onLocalResponse.bind(this)
  );

  function onLocalResponse(err) {

    if(err) {
      //self.emit('error', err);
    }

    var result = slice.call(arguments, 1);
    // If response needed
    if(callID) {

      var response = new Response(callID, err ? err : result);

      // Copy Call context to Response
      response.setContext(call.getContext());

      this._messenger.send(response);

    }

  }

};

p._callLocal = function(context, namespace, method, params, cb) {

  var func = this._getMethod(namespace, method);

  cb = cb.bind(context);

  // If local method is exposed
  if(typeof func === 'function') {
    // Call it with params
    try {
      return func.call(context, params, cb);
    } catch(err) {
      this.emit('error', err);
      return cb(err);
    }
  } else {
    return cb(new errors.UnknownMethodError(namespace, method));
  }

};

p._getMethod = function(namespace, method) {
  var nsHolder = this._exposed[namespace];
  if(nsHolder && typeof nsHolder[method] === 'function') {
    return nsHolder[method];
  }
};

p._getDescriptor = function() {
  var descriptor = {};
  _.forEach(this._exposed, function(methods, namespace) {
    descriptor[namespace] = _.keys(methods);
  });
  return descriptor;
};

/* jshint node: true, browser: true, maxparams: 6 */
var Messenger = require('./messenger');
var util = require('util');
var Message = require('./message');
var Call = require('./messages/call');
var Response = require('./messages/response');
var UnknownMethodError = require('./errors/unknown-method');
var InternalError = require('./errors/internal');
var RemoteError = require('./errors/remote');
var slice = Array.prototype.slice;

function RPC() {
  Messenger.call(this);
  this._exposed = {};
  this._pendingResponses = {};
  this._initHandlers();
  this._initDefaultMethods();
}

RPC.NAMESPACE = 'rpc';

// Expose messages constructors
RPC.Message = Message;
RPC.Call = Call;
RPC.Response = Response;

util.inherits(RPC, Messenger);

module.exports = RPC;

var p = RPC.prototype;

// call( namespace, method, [, param1, param2, ...][, cb] )
p.call = function(namespace, method, params, cb) {

  // Callback is always the last argument
  cb = arguments[arguments.length-1];

  // If callback isn't present, no need to wait for a response
  var needResponse = typeof cb === 'function';

  // Get params from arguments
  params = slice.call(
    arguments,
    2,
    needResponse ? arguments.length-1 : arguments.length
  );

  var call = new Call(namespace, method, needResponse);
  call.addParams.apply(call, params);

  // If call need response, add callback to local map
  if(needResponse) {
    this._addPendingResponse(call.id, cb);
  }

  // Send call message
  this.send(call);

  return this;

};

p.expose = function(namespace, method, func) {
  var exposed = this._exposed;
  var nsHolder = exposed[namespace] = exposed[namespace] || {};
  nsHolder[method] = func;
  return this;
};

p.getRemoteDescriptor = function(cb) {
  return this.call(RPC.NAMESPACE, 'getDescriptor', cb);
};

p._initHandlers = function() {
  this._handlers.response = this._handleResponse.bind(this);
  this._handlers.call = this._handleCall.bind(this);
};

p._initDefaultMethods = function() {
  var self = this;
  self.expose(RPC.NAMESPACE, 'getDescriptor', function(params, cb) {
    return cb(null, self._getDescriptor());
  });
};

p._addPendingResponse = function(callID, cb) {
  this._pendingResponses[callID] = cb;
};

p._handleResponse = function(message) {
  var callID = message.id;
  var pending = this._pendingResponses;
  var cb = pending[callID];
  if(typeof cb === 'function') {
    if('error' in message) {
      return cb(new RemoteError(message.error));
    } else {
      var args = [null];
      args.push.apply(args, message.result);
      return cb.apply(null, args);
    }
    delete pending[callID];
  }
};

p._handleCall = function(message) {

  var self = this;
  var namespace = message.namespace;
  var method = message.method;
  var params = message.params || [];
  var callID = message.id;
  self._callLocal(message, namespace, method, params, function(err) {
    if(err) {
      self.emit('error', err);
    }
    var result = slice.call(arguments, 1);
    // If response needed
    if(callID) {
      var response = new Response(callID, err ? err : result);
      response.meta = message.meta;
      self.send(response);
    }
  });

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
      return cb(new InternalError(err));
    }
  } else {
    return cb(new UnknownMethodError(namespace, method));
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
  var exposed = this._exposed;
  Object.keys(exposed)
    .forEach(function(namespace) {
      var methods = Object.keys(exposed[namespace]);
      descriptor[namespace] = methods;
    });
  return descriptor;
};
/* jshint node: true, browser: true, maxparams: 6 */
var Messenger = require('./messenger');
var util = require('util');
var Message = require('./messages').Message;
var Call = require('./messages').Call;
var Response = require('./messages').Response;
var errors = require('./errors');
var slice = Array.prototype.slice;

function RPC() {
  Messenger.call(this);
  this._exposed = {};
  this._pendingResponses = {};
  this._initHandlers();
  this._initDefaultMethods();
}

RPC.NAMESPACE = 'rpc';

util.inherits(RPC, Messenger);

module.exports = RPC;

var p = RPC.prototype;

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
  this._addMessageHandler('response', this._handleResponse);
  this._addMessageHandler('call', this._handleCall);
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

p._handleResponse = function(response) {

  if(!(response instanceof Response)) {
    this.emit('error', new Error('Data is not a valid Response instance !'));
    return;
  }

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

  if(!(call instanceof Call)) {
    this.emit('error', new Error('Data is not a valid Call instance !'));
    return;
  }

  var namespace = call.getNamespace();
  var method = call.getMethod();
  var params = call.getParams() || [];
  var callID = call.getId();

  var self = this;
  this._callLocal(call.getContext(), namespace, method, params, function(err) {
    if(err) {
      self.emit('error', err);
    }
    var result = slice.call(arguments, 1);
    // If response needed
    if(callID) {
      var response = new Response(callID, err ? err : result);

      // Copy Call context to Response
      response.getContext().set(call.getContext().getAll());
      response.setScope(call.getScope());
      // Define message sender as recipient
      response.setRecipients([call.getSender()]);

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
  var exposed = this._exposed;
  Object.keys(exposed)
    .forEach(function(namespace) {
      var methods = Object.keys(exposed[namespace]);
      descriptor[namespace] = methods;
    });
  return descriptor;
};

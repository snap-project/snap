var Duplex = require('stream').Duplex;
var util = require('util');
var Message = require('./message');
var Call = require('./messages/call');
var Response = require('./messages/response');
var slice = Array.prototype.slice;

function Communicator() {
  Duplex.call(this, {objectMode: true});
  this._exposed = {};
  this._pendingResponses = {};
  this._messagesQueue = [];
  this._initDefaultMethods();
}

Communicator.NAMESPACE = 'communicator';

// Expose messages constructors
Communicator.Message = Message;
Communicator.Call = Call;
Communicator.Response = Response;

util.inherits(Communicator, Duplex);

module.exports = Communicator;

var p = Communicator.prototype;

// call( name [, param1, param2, ...][, cb] )
p.call = function(namespace, method, params, cb) {

  // Callback is always the last argument
  cb = arguments[arguments.length-1];

  // If callback isn't present, no need to wait for a response
  var needResponse = typeof cb === 'function';

  // Get params from arguments
  params = slice.call(
    arguments,
    1,
    needResponse ? arguments.length-1 : arguments.length
  );

  var call = new Call(namespace, method, needResponse);
  call.addParams.apply(call, params);

  // If call need response, add callback to local map
  if(needResponse) {
    this._addPendingResponse(call.getID(), cb);
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

p.send = function(message) {
  var isValid = Message.validate(message);
  if(isValid) {
    this._enqueue(message);
  }
  return this;
};

p.getRemoteDescriptor = function(cb) {
  this.call(Communicator.NAMESPACE, 'getDescriptor', cb);
  return this;
};

p._enqueue = function(message) {
  this._messagesQueue.push(message);
  this._read();
};

p._addPendingResponse = function(callID, cb) {
  this._pendingResponses[callID] = cb;
};

p._read = function() {
  var message;
  var queue = this._messagesQueue;
  var keepPushing = true;
  while(queue.length > 0 && keepPushing) {
    message = queue.shift();
    var raw = typeof message.toJSON === 'function' ? message.toJSON() : message;
    keepPushing = this.push(raw);
  }
};

p._write = function(message, encoding, cb) {
  var isValid = Message.validate(message);
  if(isValid) {
    this._dispatchMessage(message);
  }
  return cb();
};

p._dispatchMessage = function(message) {
  switch(message.type) {
    case Response.TYPE:
        this._handleResponse(message);
      break;
    case Call.TYPE:
        this._handleCall(message);
      break;
    case Message.TYPE:
      this.emit('message', message);
      break;
    default:
      this.emit('error', new Error('Unknown message type !'), message);
      break;
  };
};

p._handleResponse = function(message) {
  var callID = message.id;
  var pending = this._pendingResponses;
  var cb = pending[callID];
  if(typeof cb === 'function') {
    if('error' in message) {
      return cb(message.error)
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

  self._callLocal(namespace, method, params, function(err) {
    if(err) {
      self.emit('error', err);
    }
    var result = slice.call(arguments, 1);
    // If response needed
    if(callID) {
      var response = new Response(callID, err ? err : result);
      self.send(response);
    }
  });

};

p._callLocal = function(namespace, method, params, cb) {

  var func = this._getMethod(namespace, method);

  // If local method is exposed
  if(typeof func === 'function') {
    // Call it with params
    try {
      return func(params, cb);
    } catch(err) {
      return cb(err);
    }
  } else {
    return cb(new Error('Unknown method name !'));
  }

};

p._getMethod = function(namespace, method) {
  var nsHolder = this._exposed[namespace];
  if(nsHolder && typeof nsHolder[method] === 'function') {
    return nsHolder[method];
  }
};

p._initDefaultMethods = function() {
  var self = this;
  self.expose(Communicator.NAMESPACE, 'getDescriptor', function(params, cb) {
    return cb(null, self._getDescriptor());
  });
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
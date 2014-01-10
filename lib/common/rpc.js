var Duplex = require('stream').Duplex;
var util = require('util');
var Message = require('./message');
var Call = require('./messages/call');
var Response = require('./messages/response');
var slice = Array.prototype.slice;

function RPC() {
  Duplex.call(this, {objectMode: true});
  this._exposed = {};
  this._pendingResponses = {};
  this._messagesQueue = [];
}

// Expose messages constructors
RPC.Message = Message;
RPC.Call = Call;
RPC.Response = Response;

util.inherits(RPC, Duplex);

module.exports = RPC;

var p = RPC.prototype;

// call( name [, param1, param2, ...][, cb] )
p.call = function(method, params, cb) {

  // Callback is always the last argument
  cb = arguments[arguments.length-1];

  // If callback isn't present, no need to wait for a response
  var needResponse = !(typeof cb === 'function');

  // Get params from arguments
  params = slice.call(
    arguments,
    1,
    needResponse ? arguments.length : arguments.length-1
  );

  var call = new Call(method, needResponse);
  call.addParams.apply(message, params);

  // If call need response, add callback to local map
  if(!needResponse) {
    this._addPendingResponse(call.getID(), cb);
  }

  // Send call message
  p.send(call);

  return this;

}; 

p.expose = function(method, func) {
  this._exposed[method] = func;
};

p.send = function(message) {
  var isValid = Message.validate(message);
  if(isValid) {
    this._enqueue(message);
  }
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
    keepPushing = this.push(message.toJSON());
  }
};

p._write = function(message) {
  var isValid = Message.validate(message);
  if(isValid) {
    this._dispatchMessage(message);
  }
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
    if(message.error) {
      return cb(message.error)
    } else {
      return cb.apply(null, [null].concat(params));
    }
    delete pending[callID];
  }
};

p._handleCall = function(message) {

  var response;
  var self = this;
  var method = message.method;
  var params = message.params || [];
  var callID = message.id;

  self._callLocal(method, params, function(err) {

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

p._callLocal = function(method, params, cb) {

  var exposed = self._exposed;
  var func = exposed[method];
  var funcArgs = params.concat(cb);

  // If local method is exposed
  if(typeof func === 'function') {
    // Call it with params
    try {
      return func.apply(null, funcArgs);
    } catch(err) {
      return cb(err);
    }
  } else {
    return cb(new Error('Unknown method name !'));
  }

};
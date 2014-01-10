var slice = Array.prototype.slice;

function ResponseHandler(consumer) {
  this._pendingResponses = {};
}

// expose ResponseHandler class
module.exports = ResponseHandler;

// Create convenience alias
var p = ResponseHandler.prototype;

p.messageTypes = ['call', 'response'];

p.handle = function(message) {
  var pending = this._pendingResponses
  if(message.id in pending) {
    var cb = pending[message.id];
    if(typeof cb === 'function') {
      if(message.error) {
        return cb(message.error);
      } else {
        return cb(null, message.result);
      }
    }
    delete pending[message.id];
  }
};

// Call
p.call = function(method, params, cb) {

  cb = arguments[arguments.length-1];
  var isNotification = !(typeof cb === 'function')

  params = slice.call(
    arguments,
    1,
    isNotification ? arguments.length : arguments.length-1
  );

  var message = {
    type: 'call',
    params: params,
    method: method
  };

  if(!isNotification) {
    var id = Date.now();
    message.id = id;
    this._pendingResponses[id] = cb;
  }

  this.send(message);

};

/* jshint node: true, browser: true */
function Message(data) {
  this.type = 'message';
  this.data = data || {};
  this.meta = {};
}

Message.validate = function(message) {
  return message &&
    'type' in (message.toJSON ? message.toJSON() : message);
};

Message.fromRaw = function(raw) {
  if(!Message.validate(raw)) {
    return null;
  }
  return new Message(raw.data);
};

var p = Message.prototype;

p.getType = function() {
  return this.type;
};

p.getData = function() {
  return this.data;
};

module.exports = Message;

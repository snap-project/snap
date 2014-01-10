function Message(data) {
  this._type = 'message';
  this._data = data;
}

Message.validate = function(message) {
  return message &&
    'type' in (message.toJSON ? message.toJSON() : message);
};

Message.TYPE = 'message';

module.exports = Message;

var p = Message.prototype;

p.toJSON = function() {
  return {
    type: Message.TYPE,
    data: this._data
  };
};
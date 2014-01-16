/* jshint node: true, browser: true */
function Message(data) {
  this.type = 'message';
  if(data !== undefined) {
    this.data = data;
  }
  this.meta = null;
}

Message.validate = function(message) {
  return message &&
    'type' in (message.toJSON ? message.toJSON() : message);
};

module.exports = Message;
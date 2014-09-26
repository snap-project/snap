/* jshint node: true */
var Message = require('../../common/messages').Message;

module.exports = function(snap) {

  var rpc = snap.rpc;

  rpc.expose('messages', 'broadcast', function(params, cb) {
    var data = params[0];
    var message = new Message(data);
    message.setSender(this.getSender());
    message.setScope(this.getScope());
    rpc.send(message);
    return cb();
  });

  rpc.expose('messages', 'sendTo', function(params, cb) {
    var recipient = params[0];
    var data = params[1];
    var message = new Message(data);
    message.setSender(this.getSender());
    message.setScope(this.getScope());
    message.addRecipient(recipient);
    rpc.send(message);
    return cb();
  });

  snap.plugins.injectClientSide(__dirname + '/client.js');

};

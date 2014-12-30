/* jshint node:true */
var Message = require('../../common/message');

module.exports = function(snap) {

  var rpc = snap.rpc;

  rpc.expose('rtc', 'broadcast', function(params, cb) {

    var data = params[0];
    var message = new Message(data);

    message.set('user', this.get('user'));
    message.set('sender', this.get('sender'), false);
    message.set('currentApp', this.get('currentApp'), false);

    rpc.send(message);

    return cb();

  });

  rpc.expose('rtc', 'sendTo', function(params, cb) {

    var recipients = params[0];
    var data = params[1];

    var message = new Message(data);

    message.set('user', this.get('user'));
    message.set('sender', this.get('sender'), false);
    message.set('currentApp', this.get('currentApp'), false);
    message.set('recipients', recipients);

    rpc.send(message);

    return cb();

  });

};

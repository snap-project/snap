/* jshint node: true */
var Message = require('../../common/message');
module.exports = function(snap) {

  var rpc = snap.rpc;

  rpc.expose('events', 'broadcast', function(params, cb) {
    var appName = params[0];
    var data = params[1];
    rpc.call('events', 'receiveMessage', appName, data);
    return cb();
  });

  snap.plugins.injectClientSide(__dirname + '/client.js');

};

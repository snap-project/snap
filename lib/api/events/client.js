/* global supervisor */
var Message = require('../../common/messages').Message;

supervisor.bridge('events', 'broadcast', broadcastHook);

supervisor.server.expose('events', 'receiveMessage', receiveMessage);

function broadcastHook(args) {
  var currentApp = this.getCurrentApp();
  // We insert the app name into the arguments
  args.splice(2, 0, currentApp);
}

function receiveMessage(params, cb) {

  var appName = params[0];
  var data = params[1];

  if( appName === supervisor.getCurrentApp() ) {
    var message = new Message(data);
    supervisor.client.send(message);
  }

  return cb();

}

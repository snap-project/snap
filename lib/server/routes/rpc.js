/* jshint node: true */
var MessageRouterStream = require('../streams/message-router');

module.exports = function(snap, server) {

  var expressApp = server.expressApp;

  var routerStream = new MessageRouterStream();
  snap.rpc.pipe(routerStream);
  routerStream.on('error', snap.logger.error.bind(snap.logger));

  function handleCall(req, res) {
    var message = req.body;
    if(message) {
      message.meta = message.meta || {};
      message.meta.session = req.session;
      snap.rpc.write(message);
    }
    return res.send(204);
  }

  var headers = {
    'Transfer-Encoding': 'identity',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'close',

  };

  function handleEventSource(req, res) {
    res.writeHead(200, headers);
    routerStream
      .getSSEStream(req.session.id)
      .pipe(res);
  }

  // Serve Supervisor bootstraping script
  expressApp.post('/rpc', handleCall);
  expressApp.get('/rpc', handleEventSource);

};
/* jshint node: true */
var MessageRouterStream = require('../streams/message-router');

module.exports = function(snap, server) {

  var expressApp = server.expressApp;

  var routerStream = new MessageRouterStream();
  snap.rpc.pipe(routerStream);

  function handleCall(req, res, next) {
    var message = req.body;
    if(message) {
      req.session.get('user', function(err, user) {
        if(err) {
          return next(err);
        }
        message.meta = message.meta || {};
        message.meta.user = user;
        snap.rpc.write(message);
        return res.send(204);
      });
    } else {
      return res.send(400);
    }
  }

  var headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  };

  function handleEventSource(req, res) {
    res.writeHead(200, headers);
    req.session.get('user', function(err, user) {
      if(err) {
        return next(err);
      }
      routerStream
        .getSSEStream(user.id)
        .pipe(res);
    });
  }

  // Serve Supervisor bootstraping script
  expressApp.post('/rpc', handleCall);
  expressApp.get('/rpc', handleEventSource);

};
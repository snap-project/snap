/* jshint node: true */
var helpers = require('./helpers');
var rpc = require('./rpc');

module.exports = function(snap, server) {

  var expressApp = server.expressApp;

  // Initialize RPC route
  expressApp.post('/rpc', handleRPC);

  function handleRPC(req, res, next) {

    var RPCRequest = req.body;

    try {
      helpers.validateRPCRequest(RPCRequest);
    } catch(err) {
      return res.send(err);
    }

    var context = {
      httpRequest: req
    };

    rpc.call(
      RPCRequest.method,
      RPCRequest.params,
      context,
      function callResultHandler(err, result) {
        if(RPCRequest.id) {
          var RPCResponse = {
            id: RPCRequest.id
          };
          if(err) {
            RPCResponse.error = err;
          } else {
            RPCResponse.result = result;
          }
          return res.send(RPCResponse);
        } else {
          return res.send(204);
        }
      }
    );

  };

  // Inject RPC service
  snap.client.inject(__dirname + '/rpc-service.js');

  return rpc;

};
var http = require('http');

module.exports = function(snap, server) {

  server.httpServer = http.createServer();

};

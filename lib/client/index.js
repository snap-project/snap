module.exports = function(snap) {

  var client = {};

  client.supervisor = require('./supervisor')(snap);

  // Convenience method
  client.inject = client.supervisor.inject;

  return client;

};
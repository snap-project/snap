module.exports = function(snap) {

  var client = {};

  client.apps = require('./apps')(snap);
  client.supervisor = require('./supervisor')(snap);

  // Convenience method
  client.inject = client.supervisor.inject;


  return client;

};
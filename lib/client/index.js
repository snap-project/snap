module.exports = function(snap) {

  var client = {};

  client.apps = require('./apps')(snap);

  var supervisor = require('./supervisor')(snap);

  client.handleSupervisor = supervisor.handle;
  client.inject = supervisor.inject;

  return client;

};
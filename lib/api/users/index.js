/* jshint node: true */
var UsersDefaultBackend = require('./default-backend');

module.exports = function(snap) {

  // Export Auth API
  var api = snap.users = require('./api')();

  // Set default backend
  api.setBackend(new UsersDefaultBackend({
    usersStore: snap.storage.getGlobalStore('users'),
    credentialsStore: snap.storage.getGlobalStore('users_credentials')
  }));

  // Expose users RPC
  require('./rpc')(snap);

};

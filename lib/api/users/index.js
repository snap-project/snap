/* jshint node: true */
var UsersApi = require('./api');
var DefaultAuthBackend = require('./default-backend');

module.exports = function(snap) {

  // Export Auth API
  var api = snap.users = new UsersApi(snap.storage);

  // Set default backend
  var usersStore = snap.storage.getGlobalStore('users');
  var credentialsStore = snap.storage.getGlobalStore('users_credentials');

  api.setBackend(new DefaultAuthBackend(usersStore, credentialsStore));

  // Expose users RPC
  require('./rpc')(snap);

};

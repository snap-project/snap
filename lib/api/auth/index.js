/* jshint node: true */
var AuthApi = require('./api');
var DefaultAuthBackend = require('./default-backend');

module.exports = function(snap) {

  // Export Auth API
  var api = snap.auth = new AuthApi(snap.users, snap.storage);

  // Set default backend
  var usersStore = snap.storage.getGlobalStore('users');
  api.setBackend(new DefaultAuthBackend(usersStore));

  // Expose Auth API as a RPC service

  snap.rpc.expose('auth', 'getUser', function authGetUser(params, cb) {
    var user = this.get('user');
    return cb(null, user);
  });

  // Expose "login" method
  snap.rpc.expose('auth', 'login', function authLogin(params, cb) {

    var credentials = params[0];

    var session = this.get('session');

    api.authenticate(credentials, function(err, user) {

      if(err) {
        snap.logger.error(err);
        return cb(err);
      }

      if(user) { // Save the user id to session
        session.userId = user.id;
        return session.save(onSessionSaved);
      } else {
        return cb(null, null);
      }

      function onSessionSaved(err) {
        if(err) {
          snap.logger.error(err);
          return cb(err);
        }
        return cb(null, user);
      }

    });

  });

  snap.plugins.injectClientSide(__dirname + '/client.js');

};

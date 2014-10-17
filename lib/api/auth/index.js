var authApiFactory = require('./api');

module.exports = function(snap) {

  // Export Auth API
  var api = snap.auth = authApiFactory(snap.users);

  // Expose Auth API to RPC
  snap.rpc.expose('auth', 'getUser', function authGetUser(params, cb) {
    var user = this.get('user');
    return cb(null, user);
  });

  snap.rpc.expose('auth', 'login', function authLogin(params, cb) {

    var credentials = params[0] || {};
    var session = this.get('session');

    return api.authenticate(credentials, authenticateHandler);

    function authenticateHandler(err, user) {

      if(err) {
        return cb(err);
      }

      if(user) {
        // Utilisateur trouvé, on modifie la session & on renvoie l'utilisateur
        session.userId = user.id;
        return session.save(sessionSavedHandler.bind(user));
      } else {
        // Aucun utilisateur associé a ces identifiants
        return cb(null, null);
      }

    }

    function sessionSavedHandler(err) {
      if(err) {
        return cb(err);
      }
      var user = this;
      return cb(null, user);
    }

  });

  snap.rpc.expose('auth', 'logout', function(params, cb) {
    var session = this.get('session');
    return session.destroy(cb);
  });

  snap.plugins.injectClientSide(__dirname + '/client.js');

};

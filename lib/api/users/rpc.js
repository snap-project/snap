/* jshint node:true */
var User = require('./user');
module.exports = function exposeUsersRPCMethods(snap) {

  var NAMESPACE = 'users';

  // Expose Auth API as a RPC service

  snap.rpc.expose(NAMESPACE, 'getUser', function usersGetUser(params, cb) {
    var user = this.get('user');
    return cb(null, user);
  });

  snap.rpc.expose(NAMESPACE, 'register', function usersREgister(params, cb) {

    var username = params[0];
    var password = params[1];

    var user = this.get('user');

    return snap.users.register(username, password, user, cb);

  });

  // Expose "login" method
  snap.rpc.expose(NAMESPACE, 'login', function usersLogin(params, cb) {

    var username = params[0];
    var password = params[1];

    var session = this.get('session');

    snap.users.authenticate(username, password, onUserAuthenticated);

    function onUserAuthenticated(err, user) {

      if(err) {
        snap.logger.error(err);
        return cb(err);
      }

      if(user) { // Save the user id to session
        session.userUid = user.get('uid');
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

    }

  });

  snap.rpc.expose(NAMESPACE, 'save', function usersSave(params, cb) {
    var user = params[0];
    try {
      user = new User(user);
    } catch(err) {
      return cb(err);
    }
    return snap.users.save(user, cb);
  });

  snap.plugins.injectClientSide(__dirname + '/client.js');

};

/* jshint node:true */
module.exports = function exposeUsersRPCMethods(snap) {

  var NAMESPACE = 'users';

  // Expose Auth API as a RPC service

  snap.rpc.expose(NAMESPACE, 'getUser', function usersGetUser(params, cb) {
    var user = this.get('user');
    return cb(null, user);
  });

  snap.rpc.expose(NAMESPACE, 'register', function usersREgister(params, cb) {

    var credentials = params[0];

    var user = this.get('user');

    return snap.users.register(user, credentials, cb);

  });

  // Expose "login" method
  snap.rpc.expose(NAMESPACE, 'login', function usersLogin(params, cb) {

    var credentials = params[0];

    var session = this.get('session');

    snap.users.authenticate(credentials, onUserAuthenticated);

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

  snap.rpc.expose(NAMESPACE, 'changeNickname', function changePseudonym(params, cb) {

    var nickname = params[0];
    var user = this.get('user');

    try {
      user.set('nickname', nickname);
    } catch(err) {
      return cb(err);
    }

    return snap.users.save(user, cb);

  });

  snap.plugins.injectClientSide(__dirname + '/client.js');

};

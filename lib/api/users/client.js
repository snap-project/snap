// Client Side
module.exports = function(Snap) {

  function usersServiceFactory(appName, config) {

    var users = {};

    users.getCurrentUser = function(cb) {
      Snap.rpc.call('users:getCurrentUser', function(err, results) {
        if(err) {
          return cb(err);
        }
        return cb(null, results[0]);
      });
      return users;
    };

    users.setUserName = function(name, cb) {
      Snap.rpc.call('users:setUserName', [name], function(err, results) {
        if(err) {
          return cb(err);
        }
        return cb(null, results[0]);
      });
      return users;
    };

    return users;

  }

  Snap.registerService('users', usersServiceFactory);

};
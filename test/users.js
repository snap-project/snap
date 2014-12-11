/* jshint node:true */
var storageAPIFactory = require('../lib/api/storage/api');
var DefaultAuthBackend = require('../lib/api/users/default-backend');
var User = require('../lib/api/users/user');

/*
 * Default Backend Tests
 */

var defaultBackend = exports.defaultBackend = {};

// Set up test environment
defaultBackend.setUp = function(cb) {

  var storage = storageAPIFactory({adapter: 'memdown'});
  var usersStore = storage.getGlobalStore('users');
  var credentialsStore = storage.getGlobalStore('users_credentials');

  this.backend = new DefaultAuthBackend(usersStore, credentialsStore);

  return cb();

};

defaultBackend.registerThenAuthenticate = function(test) {

  var backend = this.backend;

  var username = 'foo@bar.com';
  var password = 'foobar';

  var user = new User();

  backend.register(username, password, user.toJSON(), function(err) {

    test.ifError(err);

    backend.authenticate(username, password, function(err, userUid) {

      test.ifError(err);

      test.equal(
        user.get('uid'), userUid,
        'Users should have the same UID !'
      );

      return test.done();

    });

  });


};

defaultBackend.changePassword = function(test) {

  var backend = this.backend;

  var username = 'foo@bar.com';
  var oldPassword = 'foobar';
  var newPassword = 'baz';

  var user = new User();

  backend.register(username, oldPassword, user.toJSON(), onUserRegistered);

  function onUserRegistered(err) {
    test.ifError(err);
    backend.changePassword(
      username, newPassword,
      onCredentialsChanged
    );
  }

  function onCredentialsChanged(err) {
    test.ifError(err);
    backend.authenticate(username, newPassword, onUserAuthenticated);
  }

  function onUserAuthenticated(err, userUid) {

    test.ifError(err);

    test.equal(
      user.get('uid'), userUid,
      'Users should have the same UID !'
    );

    return test.done();

  }

};

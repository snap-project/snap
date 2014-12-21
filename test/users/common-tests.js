/* jshint node:true */
var User = require('../../lib/api/users/user');

exports.authenticate = function(test) {

  var users = this.users;
  var credentials1 = this.credentials1;
  var user = users.createTempUser();

  users.register(user, credentials1, function(err) {

    test.ifError(err);

    users.authenticate(credentials1, function(err, authenticatedUser) {

      test.ifError(err);

      test.equals(
        user.get('uid'), authenticatedUser.get('uid'),
        'Users should have the same UID !'
      );

      return test.done();

    });

  });


};

exports.changeCredentials = function(test) {

  var users = this.users;

  var credentials1 = this.credentials1;
  var credentials2 = this.credentials2;

  var user = users.createTempUser();

  users.register(user, credentials1, onUserRegistered);

  function onUserRegistered(err) {
    test.ifError(err);
    users.changeCredentials(
      user.get('uid'), credentials2,
      onCredentialsChanged
    );
  }

  function onCredentialsChanged(err) {
    test.ifError(err);
    users.authenticate(credentials2, onUserAuthenticated);
  }

  function onUserAuthenticated(err, authenticatedUser) {

    test.ifError(err);

    test.equal(
      user.get('uid'), authenticatedUser.get('uid'),
      'Users should have the same UID !'
    );

    return test.done();

  }

};

exports.saveTempUser = function(test) {

  var users = this.users;
  var user = users.createTempUser();

  var pseudonym = 'Foo';
  user.set('pseudonym', pseudonym);

  users.save(user, onUserSaved);

  function onUserSaved(err, savedUser) {

    test.ifError(err);
    test.ok(savedUser, 'save() should return the saved user !');

    users.findByUid(user.get('uid'), onUserFound);

  }

  function onUserFound(err, savedUser) {

    test.ifError(err);
    test.ok(user, 'findByUid() should return the user !');

    test.equals(
      pseudonym,
      savedUser.get('pseudonym'),
      'Users should have the same pseudonym !'
    );

    test.done();

  }

};

exports.saveRegisteredUser = function(test) {

  var users = this.users;
  var user = users.createTempUser();
  var credentials1 = this.credentials1;
  var pseudonym = 'Foo';

  users.register(user, credentials1, onUserRegistered);

  function onUserRegistered(err, registeredUser) {

    test.ifError(err);
    test.ok(
      registeredUser instanceof User,
      'register() should return the registered user !'
    );

    registeredUser.set('pseudonym', pseudonym);

    users.save(registeredUser, onUserSaved);

  }

  function onUserSaved(err, savedUser) {

    test.ifError(err);
    test.ok(
      savedUser instanceof User,
      'save() should return the saved user !'
    );

    users.findByUid(user.get('uid'), onUserFound);

  }

  function onUserFound(err, savedUser) {

    test.ifError(err);
    test.ok(user, 'findByUid() should return the user !');

    test.equals(
      pseudonym,
      savedUser.get('pseudonym'),
      'Users should have the same pseudonym !'
    );

    test.done();
  }

};

exports.findAll = function(test) {

  var users = this.users;
  var credentials1 = this.credentials1;
  var user1 = users.createTempUser();
  var user2 = users.createTempUser();

  user1.set('pseudonym', 'foo');

  users.register(user1, credentials1, onUserRegistered);

  function onUserRegistered(err) {
    test.ifError(err);
    users.findAll(onUsersFound);
  }

  function onUsersFound(err, usersFound) {

    test.ifError(err);

    test.equals(
      usersFound.length,
      2,
      'findAll() should return 2 users !'
    );

    test.equals(
      usersFound[0].get('uid'),
      user1.get('uid'),
      'User 1 should be the registered user !'
    );

    test.equals(
      usersFound[1].get('uid'),
      user2.get('uid'),
      'User 2 should be the temporary user !'
    );

    return test.done();

  }


};

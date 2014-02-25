var storageAPIFactory = require('../lib/api/storage/api');
var usersAPIFactory = require('../lib/api/users/api');

// Set up test environment
exports.setUp = function(cb) {
  var storage = storageAPIFactory();
  var store = storage.getGlobalStore('users');
  var users = this.users = usersAPIFactory({store: store});
  return cb();
};

exports.createUser = function(test) {
  var user = this.users.create();
  this.users.validate(user, function(errs) {
    test.ifError(errs);
    test.done();
  });
};

exports.createUser = function(test) {
  var user = this.users.create();
  this.users.validate(user, function(errs) {
    test.ifError(errs);
    test.done();
  });
};

exports.findById = function(test) {

  var users = this.users;

  // Create new user
  var user = users.create();

  // Save it
  users.save(user, function(err) {

    test.ifError(err);

    // Get user Id
    var userId = user.id;

    // Try to fetch it from store
    users.findById(userId, function(err, storedUser) {
      test.ifError(err);
      test.equals(user.nickname, storedUser.nickname, 'Local & stored user should have the same nickname !');
      test.done();
    });

  });

};

exports.findByNickname = function(test) {

  var users = this.users;

  // Create new user
  var user = users.create();

  // Save it
  users.save(user, function(err) {

    test.ifError(err);

    // Get user Id
    var userNickname = user.nickname;

    // Try to fetch it from store
    users.findByNickname(userNickname, function(err, storedUser) {
      test.ifError(err);
      test.equals(user.nickname, storedUser.nickname, 'Local & stored user should have the same nickname !');
      test.done();
    });

  });
  
};
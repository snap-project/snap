this.users =  {

  setUp: function(cb) {
    this.Snap = window.Snap;
    return cb();
  },

  getCurrentUser: function(test) {
    this.Snap.users.getCurrentUser(function(err, user) {
      test.ifError(err);
      test.ok(
        user,
        'User should not be falsy !'
      );
      test.done();
    });
  },

  setUserName: function(test) {
    this.Snap.users.setUserName('test', function(err, user) {
      test.ifError(err);
      test.ok(
        user,
        'User should not be falsy !'
      );
      test.ok(
        user.name === 'test',
        'User name should be equal to "test" !'
      );
      test.done();
    });
  }

};
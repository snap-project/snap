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
  }

};
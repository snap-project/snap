this.apps =  {

  setUp: function(cb) {
    this.Snap = window.Snap;
    return cb();
  },

  getAppsList: function(test) {
    this.Snap.apps.getAppsList(function(err, apps) {
      test.ifError(err);
      test.ok(
        apps.indexOf('tests') !== -1,
        'Apps list should contain "tests" app !'
      );
      test.done();
    });
  },

  getAppManifest: function(test) {
    this.Snap.apps.getAppManifest('tests', function(err, manifest) {
      test.ifError(err);
      test.ok(
        manifest,
        'Manifest should not be falsy !'
      );
      test.done();
    });
  }

};
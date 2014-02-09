var StorageAPI = require('../lib/api/storage/storage-api');

// Set up test environment
exports.setUp = function(cb) {
  this.storage = new StorageAPI();
  return cb();
};

function testSimpleReadWrite(test, store) {
  var key = 'test';
  store.put(key, {hello: 'world'}, function(err) {
    test.ifError(err);
    store.get(key, function(err, obj) {
      test.ifError(err);
      test.equals(obj.hello, 'world', 'Object should have a property hello === "world" !');
      test.done();
    });
  });
}

exports.getPluginStore = function(test) {
  var store = this.storage.getPluginStore('dummy');
  test.ok(store, 'Should return a levelup store !');
  testSimpleReadWrite(test, store);
};

exports.getGlobalStore = function(test) {
  var store = this.storage.getGlobalStore('dummy');
  test.ok(store, 'Should return a levelup store !');
  testSimpleReadWrite(test, store);
};

exports.getAppStore = function(test) {
  var store = this.storage.getAppStore('dummy');
  test.ok(store, 'Should return a levelup store !');
  testSimpleReadWrite(test, store);
};
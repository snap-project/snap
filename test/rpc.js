/* jshint node:true */
var RPC = require('../lib/common/rpc').RPC;

// Basic test group
var basic = exports.basic = {};

basic.exposeAndCallMethod = function(test) {

  var rpc1 = new RPC();
  var rpc2 = new RPC();

  rpc1.getMessenger()
    .pipe(rpc2.getMessenger())
    .pipe(rpc1.getMessenger());

  rpc2.expose('foo', 'bar', function(params, cb) {
    return cb(null, 'bar');
  });

  rpc1.call('foo', 'bar', function(err, res) {
    test.ifError(err);
    test.equal(res, 'bar', 'res should be equal to "bar" !');
    test.done();
  });

};

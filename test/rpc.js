var RPC = require('../lib/common/rpc');
var Message = require('../lib/common/messages').Message;

// Basic test group
var basic = exports.basic = {};

basic.exposeAndCallMethod = function(test) {

  var rpc1 = new RPC();
  var rpc2 = new RPC();

  rpc1.pipe(rpc2).pipe(rpc1);

  rpc2.expose('foo', 'bar', function(params, cb) {
    return cb(null, 'bar');
  });

  rpc1.call('foo', 'bar', function(err, res) {
    test.ifError(err);
    test.equal(res, 'bar', 'res should be equal to "bar" !');
    test.done();
  });

};

var RPC = require('../lib/common/rpc');

// Basic test group
var basic = exports.basic = {};

basic.sendMessage = function(test) {

  var rpc1 = new RPC();
  var rpc2 = new RPC();

  rpc1.pipe(rpc2);

  var message = new RPC.Message({foo: 'bar'});

  rpc2.once('message', function(message) {
    test.equal(
      message.data.foo,
      'bar',
      'It should receive a message with message.data.foo === "bar"'
    );
    test.done();
  });

  rpc1.send(message);

};

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


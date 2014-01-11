var Communicator = require('../lib/common/communicator');

// Basic test group
var basic = exports.basic = {};

basic.sendMessage = function(test) {

  var com1 = new Communicator();
  var com2 = new Communicator();

  com1.pipe(com2);

  var message = new Communicator.Message({foo: 'bar'});

  com2.on('message', function(message) {
    test.equal(
      message.data.foo,
      'bar',
      'It should receive a message with message.data.foo === "bar"'
    );
    test.done();
  });

  com1.send(message);

};

basic.exposeAndCallMethod = function(test) {

  var com1 = new Communicator();
  var com2 = new Communicator();

  com1.pipe(com2).pipe(com1);

  com2.expose('foo', 'bar', function(params, cb) {
    return cb(null, 'bar');
  });

  com1.call('foo', 'bar', function(err, res) {
    test.ifError(err);
    test.equal(res, 'bar', 'res should be equal to "bar" !');
    test.done();
  });

};


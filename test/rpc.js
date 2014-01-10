var RPC = require('../lib/common/rpc');

exports.testSendMessage = function(test) {

  var rpc1 = new RPC();
  var rpc2 = new RPC();

  rpc1.pipe(rpc2);

  var message = new RPC.Message({foo: 'bar'});

  rpc2.once('message', function(message) {
    test.equal(
      message.data.foo,
      'bar',
      'It sould receive a message with message.data.foo === "bar"'
    );
    test.done();
  });

  rpc1.send(message);

};
/* jshint node:true */
var Messenger = require('../lib/common/messenger');
var Message = require('../lib/common/message');

// Basic test group
var basic = exports.basic = {};

basic.sendMessage = function(test) {

  var m1 = new Messenger();
  var m2 = new Messenger();

  m1.pipe(m2);

  var message = new Message();
  message.setPayload({foo: 'bar'});

  m2.once('message', function(message) {
    test.equal(
      message.getPayload().foo,
      'bar',
      'It should receive a message with message.data.foo === "bar"'
    );
    test.done();
  });

  m1.send(message);

};

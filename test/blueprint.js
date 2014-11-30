/* jshint node:true */
var Blueprint = require('../lib/util/blueprint');

exports.setUp = function(done) {
  this.fooSchema = {
    type: 'object',
    properties: {
      foo: {
        type: 'string',
        pattern: '^bar$'
      }
    }
  };
  done();
};

exports.createNewEntity = function(test) {
  var Foo = Blueprint.create('Foo', this.fooSchema);
  var foo = new Foo();
  test.equal(foo instanceof Foo, true, 'foo should be an instance of Foo');
  test.done();
};

exports.getExistingBlueprint = function(test) {

  Blueprint.create('Foo', this.fooSchema);

  var Foo = Blueprint.get('Foo');

  test.ok(Foo, 'Foo should be defined');

  var foo = new Foo();
  test.equal(foo instanceof Foo, true, 'foo should be an instance of Foo');
  test.done();
};

exports.setAttribute = function(test) {
  var Foo = Blueprint.create('Foo', this.fooSchema);
  var foo = new Foo();
  foo.set('foo', 'bar');
  test.equal(foo.get('foo'), 'bar', 'foo attributes should be equal to "bar"');
  test.done();
};

exports.setUnallowedAttribute = function(test) {
  var Foo = Blueprint.create('Foo', this.fooSchema);
  var foo = new Foo();
  test.throws(function() {
    foo.set('foo', 'dhu');
  }, 'should throw an error');
  test.done();
};

exports.hasAttribute = function(test) {
  var Foo = Blueprint.create('Foo', this.fooSchema);
  var foo = new Foo();
  foo.set('baz', 'bazinga');
  test.ok(foo.has('baz'), 'foo should have baz attribute');
  test.done();
};

exports.delAttribute = function(test) {
  var Foo = Blueprint.create('Foo', this.fooSchema);
  var foo = new Foo();
  foo.set('baz', 'bazinga');
  test.ok(foo.has('baz'), 'foo should have baz attribute');
  foo.del('baz');
  test.ok(!foo.has('baz'), 'foo should not have baz attribute');
  test.done();
};

exports.initializeEntity = function(test) {

  var Foo = Blueprint.create(
    'Foo',
    this.fooSchema,
    {
      initialize: function() {
        this.set('foo', 'bar');
      }
    }
  );

  var foo = new Foo();
  test.equal(foo.get('foo'), 'bar', 'foo should be equal to "bar"');
  test.done();

};

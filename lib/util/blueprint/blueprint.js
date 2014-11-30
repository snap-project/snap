/* jshint node:true */
var Entity = require('./entity');
var _ = require('lodash');

var _registry = {};
var Blueprint = {};

Blueprint.create = function(name, jsonSchema, methods) {

  jsonSchema = jsonSchema ||  {type: 'object', title: name};
  methods = methods || null;

  var entityConstructor =  function() {
    this._schema = jsonSchema;
    Entity.apply(this, arguments);
    if(typeof this.initialize === 'function') {
      this.initialize();
    }
  };

  entityConstructor.prototype = Object.create(Entity.prototype);
  entityConstructor.prototype.constructor = entityConstructor;

  _.merge(entityConstructor.prototype, methods);

  _registry[name] = entityConstructor;

  return entityConstructor;

};

Blueprint.get = function(name) {
  return _registry[name];
};

module.exports = Blueprint;

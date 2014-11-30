/* jshint node:true */
var _ = require('lodash');
var Validator = require('jsonschema').Validator;

function Entity(attrs) {
  this._attrs = {};
  if(_.isObject(attrs)) {
    this.set(attrs);
  }
}

var p = Entity.prototype;

p.set = function(key, value) {

  var self = this;
  var newAttrs = _.cloneDeep(this._attrs);

  if(arguments.length === 1) {
    _.forEach(key, function(value, key) {
      self._set(newAttrs, key, value);
    });
  } else {
    this._set(newAttrs, key, value);
  }

  this.validate(newAttrs);

  this._attrs = newAttrs;

  return this;

};

p._set = function(obj, key, value) {
  obj[key] = value;
};

p.get = function(key, defaultValue) {
  return key in this._attrs ? this._attrs[key] : defaultValue;
};

p.has = function(key) {
  return key in this._attrs;
};

p.del = function(key) {
  var newAttrs = _.cloneDeep(this._attrs);
  delete newAttrs[key];
  this.validate(newAttrs);
  this._attrs = newAttrs;
  return this;
};

p.validate = function(attrs) {
  attrs = attrs || this._attrs;
  var schema = this._schema;
  var validator = new Validator();
  return validator.validate(attrs, schema, {throwError: true});
};

p.toJSON = function() {
  return _.cloneDeep(this._attrs);
};

module.exports = Entity;

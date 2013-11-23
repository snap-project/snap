var _ = require('lodash');
var uuid = require('node-uuid');

function User(db, attributes) {
  this._db = db;
  this._attributes = attributes || {};
  this._generateUserID();
}

module.exports = User;

var p = User.prototype;

p.save = function(cb) {
  var user = this;
  var attributes = user._attributes;
  user._db.update(
    {_id: attributes._id || -1},
    user._attributes,
    {upsert: true, multi: false},
    function(err) {
      if(err) {
        return cb(err);
      }
      return next(null, user);
    }
  );
  return user;
};

p.get = function(key) {
  return this._attributes[key];
};

p.set = function(key, value) {
  this._attributes[key] = value;
  return this;
};

p.del = function(key) {
  delete this._attributes[key];
  return this;
};

p.isPersistent = function() {
  return !!this.get('_id');
};

p.setName = function(name) {
  return this.set('name', name);
};

p.getName = function() {
  return this.get('name');
};

p.toJSON = function() {
  return _.clone(this._attributes);
};

p._generateUserID = function() {
  var userID = this.get('userID');
  if(!userID) {
    this.set('userID', uuid.v4());
  }
  return this;
};



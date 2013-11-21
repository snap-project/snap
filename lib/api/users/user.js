var _ = require('lodash');

function User(db, attributes) {
  this._db = db;
  this._attributes = attributes || {};
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

p.toJSON = function() {
  return _.clone(this._attributes);
};



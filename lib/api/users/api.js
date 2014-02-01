var JaySchema = require('jayschema');
var _ = require('lodash');
var UserSchema = require('./user-schema');

var _store = null;
// Define the store used to save users
exports.setStore = function(store) {
  _store = store;
}

// Create a new user (not persisted yet)
exports.create = function(values) {
  values = values || {};
  return _.merge({
    nickname: 'anonymous_' + Date.now()
  }, values);
};

// Save (upsert) the given user
exports.save = function(user, cb) {
  jay.validate(user, UserSchema, function(errs) {
    if(errs) {
      return cb(errs);
    }
    var _id = user._id;
    if(_id) {
      var values = _.cloneDeep(user);
      delete values._id;
      _store.update({ _id: user._id }, values, {}, function(err) {
        if(err) {
          return cb(err);
        }
        return cb(null, user);
      });
    } else {
      return _store.insert(user, cb);
    }
  });
  return exports;
};

// Find user by his nickname
exports.findByNickname = function(nickname, cb) {
  _store.find({ nickname: nickname }, cb);
  return exports;
};

// Find user by his id
exports.findById = function(userId, cb) {
  _store.findOne({_id: userId}, cb);
  return exports;
};
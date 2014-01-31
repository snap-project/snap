var JaySchema = require('jayschema');
var _ = require('lodash');
var UserSchema = require('./user-schema');

var _store = null;
exports.setStore = function(store) {
  _store = store;
}

exports.create = function(values) {
  values = values || {};
  return _.merge({
    nickname: 'anonymous_' + Date.now()
  }, values);
};

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

exports.findByNickname = function(nickname, cb) {
  _store.find({ nickname: nickname }, cb);
  return exports;
};

exports.findById = function(userId, cb) {
  _store.findOne({_id: userId}, cb);
  return exports;
};
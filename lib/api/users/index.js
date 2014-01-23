var JaySchema = require('jayschema');
var UserSchema = require('./user-schema');
var _ = require('lodash');

module.exports = function(snap) {

  var store = snap.storage.getGlobalStore('users');

  var jay = new JaySchema();

  var users = snap.users = {};

  users.create = function(values) {
    values = values || {};
    return _.extend({
      nickname: 'anonymous_' + Date.now()
    }, values);
  };

  users.save = function(user, cb) {
    jay.validate(user, UserSchema, function(errs) {
      if(errs) {
        return cb(errs);
      }
      var _id = user._id;
      if(_id) {
        var values = _.cloneDeep(user);
        delete values._id;
        store.update({ _id: user._id }, values, {}, function(err) {
          if(err) {
            return cb(err);
          }
          return cb(null, user);
        });
      } else {
        return store.insert(user, cb);
      }
    });
    return users;
  };

  users.findByNickname = function(nickname, cb) {
    store.find({ nickname: nickname }, cb);
    return users;
  };

  users.findById = function(userId, cb) {
    store.findOne({_id: userId}, cb);
    return users;
  };

};
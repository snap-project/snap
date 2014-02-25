var JaySchema = require('jayschema');
var assert = require('assert');
var _ = require('lodash');
var uuid = require('node-uuid');
var UserSchema = require('./user-schema');

module.exports = exports = function usersAPIFactory(config) {

  config = config || {};
  var _store = config.store;
  var _jay = new JaySchema();
  var api = {};

  assert.ok(_store, 'store parameter is mandatory !');

  // Create a new user (not persisted yet)
  api.create = function(values) {
    values = values || {};
    return _.merge({
      id: uuid.v4(),
      nickname: 'anonymous_' + Date.now()
    }, values);
  };

  // Validate user schema
  api.validate = function(user, cb) {
    _jay.validate(user, UserSchema, cb);
    return api;
  };

  // Save (upsert) the given user
  api.save = function(user, cb) {
    api.validate(user, function(errs) {
      if(errs) {
        return cb(errs);
      }
      return _store.put(user.id, user, cb);
    });
    return api;
  };

  // Find user by his nickname
  api.findByNickname = function(nickname, cb) {

    var stream = _store.createReadStream();

    function cleanUpAndReturn(err, user) {
      stream.removeAllListeners();
      return cb(err, user);
    }

    stream.on('data', function(data) {
      if(data.value && data.value.nickname === nickname) {
        return cleanUpAndReturn(null, data.value);
      }
    });

    stream.once('error', cleanUpAndReturn);
    stream.once('end', cleanUpAndReturn.bind(null, null, null));

    return api;
    
  };

  // Find user by his id
  api.findById = function(userId, cb) {
    _store.get(userId, cb);
    return api;
  };

  return api;

};


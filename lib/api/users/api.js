var JaySchema = require('jayschema');
var assert = require('assert');
var _ = require('lodash');
var uuid = require('node-uuid');
var UserSchema = require('./user-schema');

module.exports = exports = function usersApiFactory(store) {

  assert.ok(store, 'store parameter is mandatory !');

  var jay = new JaySchema();
  var api = {};

  // Create a new user (not persisted yet)
  api.create = function(values) {
    values = values || {};
    return _.merge({
      id: uuid.v4(),
      username: 'anonymous_' + Date.now()
    }, values);
  };

  // Validate user schema
  api.validate = function(user, cb) {
    jay.validate(user, UserSchema, cb);
    return api;
  };

  // Save (upsert) the given user
  api.save = function(user, cb) {
    api.validate(user, function(errs) {
      if(errs) {
        return cb(errs);
      }
      return store.put(user.id, user, cb);
    });
    return api;
  };

  // Find user by his nickname
  api.findByUsername = function(username, cb) {

    var stream = store.createReadStream();

    function cleanUpAndReturn(err, user) {
      stream.removeAllListeners();
      return cb(err, user);
    }

    stream.on('data', function(data) {
      if(data.value && data.value.username === username) {
        return cleanUpAndReturn(null, data.value);
      }
    });

    stream.once('error', cleanUpAndReturn);
    stream.once('end', cleanUpAndReturn.bind(null, null, null));

    return api;

  };

  // Find user by his id
  api.findById = function(userId, cb) {

    store.get(userId, getUserHandler);
    return api;

    function getUserHandler(err, user) {
      if(err) {
        if(err.name === 'NotFoundError') {
          return cb(null, null);
        } else {
          return cb(err);
        }
      }
      return cb(null, user);
    }

  };

  return api;

};

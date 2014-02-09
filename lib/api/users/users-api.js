var JaySchema = require('jayschema');
var _ = require('lodash');
var uuid = require('node-uuid');
var UserSchema = require('./user-schema');

function UsersAPI(store) {
  this._store = store;
  this._jay = new JaySchema();
};

module.exports = exports = UsersAPI;

var p = UsersAPI.prototype;

// Create a new user (not persisted yet)
p.create = function(values) {
  values = values || {};
  return _.merge({
    id: uuid.v4(),
    nickname: 'anonymous_' + Date.now()
  }, values);
};

// Validate user schema
p.validate = function(user, cb) {
  this._jay.validate(user, UserSchema, cb);
  return this;
};

// Save (upsert) the given user
p.save = function(user, cb) {
  var self = this;
  self.validate(user, function(errs) {
    if(errs) {
      return cb(errs);
    }
    return self._store.put(user.id, user, cb);
  });
  return self;
};

// Find user by his nickname
p.findByNickname = function(nickname, cb) {

  var stream = this._store.createReadStream();

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

  return this;
  
};

// Find user by his id
p.findById = function(userId, cb) {
  this._store.get(userId, cb);
  return this;
};
/* jshint node:true*/
var User = require('./user');

var _backend;
var _tempUsers = {};

module.exports = exports = {};

exports.setBackend = function(backend) {
  _backend = backend;
  return exports;
};

exports.getBackend = function() {
  return _backend;
};

exports.createTempUser = function() {
  var user = new User();
  _tempUsers[user.get('uid')] = user.toJSON();
  return user;
};

exports.authenticate = function(username, password, cb) {

  _backend.authenticate(username, password, onBackendResult);
  return exports;

  function onBackendResult(err, uid) {

    if(err) {
      return cb(err);
    }

    if(uid) {
      return exports.findUserByUid(uid, cb);
    } else {
      return cb(null, null);
    }

  }

};

exports.findUserByUid = function(uid, cb) {

  if(uid in _tempUsers) {
    var user = new User(_tempUsers[uid]);
    process.nextTick(cb.bind(null, null, user));
  } else {
    _backend.findUserByUid(uid, _hydrateUser.bind(null, cb));
  }

  return exports;

};

exports.save = function(user, cb) {

  if(!user instanceof User) {
    throw new Error('user should be an instance of User.');
  }

  var uid = user.get('uid');

  if(uid in _tempUsers) {
    _tempUsers[uid] = user.toJSON();
    process.nextTick(cb.bind(null, null, user));
  } else {
    _backend.save(user.toJSON(), _hydrateUser.bind(null, cb));
  }

  return exports;

};

exports.register = function(username, password, user, cb) {

  if(!user instanceof User) {
    throw new Error('user should be an instance of User.');
  }

  var uid = user.get('uid');

  if(uid in _tempUsers) {
    delete _tempUsers[uid];
  }

  _backend.register(
    username, password,
    user.toJSON(),
    _hydrateUser.bind(null, cb)
  );

  return exports;

};

// Private

// Transform raw user attributes to valid User entity
function _hydrateUser(cb, err, userAttrs) {

  if(err) {
    return cb(err);
  }

  var user;

  if(userAttrs) {
    try {
      user = new User(userAttrs);
    } catch(err) {
      return cb(err);
    }
  }

  cb(null, user);

  return exports;

}

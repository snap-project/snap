/* jshint node:true*/
var User = require('./user');

function AuthApi() {
  this._tempUsers = {};
}

module.exports = AuthApi;

var p = AuthApi.prototype;

p.createTempUser = function() {
  var user = new User();
  this._tempUsers[user.get('uid')] = user.toJSON();
  return user;
};

p.authenticate = function(username, password, cb) {

  var backend = this._backend;
  backend.authenticate(username, password, onBackendResult.bind(this));
  return this;

  function onBackendResult(err, uid) {

    if(err) {
      return cb(err);
    }

    if(uid) {
      return this.findUserByUid(uid, cb);
    } else {
      return cb(null, null);
    }

  }

};

p.findUserByUid = function(uid, cb) {

  if(uid in this._tempUsers) {
    var user = new User(this._tempUsers[uid]);
    process.nextTick(cb.bind(null, null, user));
  } else {
    this.getBackend().findUserByUid(uid, _hydrateUser.bind(null, cb));
  }

  return this;

};

p.save = function(user, cb) {

  if(!user instanceof User) {
    throw new Error('user should be an instance of User.');
  }

  var uid = user.get('uid');

  if(uid in this._tempUsers) {
    this._tempUsers[uid] = user.toJSON();
    process.nextTick(cb.bind(null, null, user));
  } else {
    this.getBackend().save(user.toJSON(), _hydrateUser.bind(null, cb));
  }

  return this;

};

p.register = function(username, password, user, cb) {

  if(!user instanceof User) {
    throw new Error('user should be an instance of User.');
  }

  var uid = user.get('uid');

  if(uid in this._tempUsers) {
    delete this._tempUsers[uid];
  }

  return this.getBackend()
    .register(
      username, password,
      user.toJSON(),
      _hydrateUser.bind(null, cb)
    )
  ;

};

p.setBackend = function(backend) {
  this._backend = backend;
  return this;
};

p.getBackend = function() {
  return this._backend;
};

// Internals

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

  return cb(null, user);

}

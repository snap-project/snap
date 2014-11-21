/* jshint node:true*/
var uuid = require('node-uuid');

function AuthApi() {
  this._tempUsers = {};
}

module.exports = AuthApi;

var p = AuthApi.prototype;

p.createTempUser = function() {
  var user = {
    id: uuid.v4()
  };
  this._tempUsers[user.id] = user;
  return user;
};

p.authenticate = function(credentials, cb) {

  var backend = this._backend;
  backend.authenticate(credentials, onBackendResult);
  return this;

  function onBackendResult(err, userId) {
    if(err && !err.notFound) {
      return err;
    }
    if(userId) {
      return backend.findUserById(userId, cb);
    } else {
      return cb(null, null);
    }
  }

};

p.findUserById = function(userId, cb) {

  if(userId in this._tempUsers) {
    var user = this._tempUsers[userId];
    process.nextTick(cb.bind(null, null, user));
  } else {
    this._backend.findUserById(userId, onBackendResult);
  }

  return this;

  function onBackendResult(err, user) {
    if(err && !err.notFound) {
      return err;
    }
    return cb(null, user);
  }

};

p.save = function() {

};

p.setBackend = function(backend) {
  this._backend = backend;
  return this;
};

p.getBackend = function() {
  return this._backend;
};

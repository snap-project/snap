/* jshint node: true */
var crypto = require('crypto');

function AuthDefaultBackend(usersStore, credentialsStore) {
  this._usersStore = usersStore;
  this._credentialsStore = credentialsStore;
}

module.exports = AuthDefaultBackend;

var p = AuthDefaultBackend.prototype;

p.findUserByUid = function(uid, cb) {

  return this._usersStore.get(uid, onStoreResult);

  function onStoreResult(err, userAttrs) {
    if(err && !err.notFound) {
      return cb(err);
    }
    return cb(null, userAttrs);
  }

};

p.authenticate = function(username, password, cb) {

  if(!username || !password) {
    var err = new Error('Credentials must be set.');
    return process.nextTick(cb.bind(null, err));
  }

  this._credentialsStore.get(username, onStoreResult.bind(this));

  function onStoreResult(err, credentials) {

    if(err && !err.notFound) {
      return cb(err);
    }

    if(!credentials) {
      return cb(new Error('Invalid credentials.'));
    }

    this._hashPassword(
      password, credentials.salt,
      onHashResult.bind(this, credentials)
    );

  }

  function onHashResult(credentials, err, hash) {

    if(err) {
      return cb(err);
    }

    if(hash === credentials.hash) {
      return cb(null, credentials.userUid);
    } else {
      return cb(new Error('Invalid credentials.'));
    }

  }

};

p.save = function(user, cb) {
  this._usersStore.put(user.uid, user, cb);
};

p.register = function(username, password, user, cb) {

  var credentials = {
    userUid: user.uid
  };

  this._credentialsStore.get(username, onCredentialsSearchResult.bind(this));

  function onCredentialsSearchResult(err) {

    if(err && !err.notFound) {
      return cb(err);
    }

    if(!err) {
      return cb(new Error('Username already exist !'));
    }

    return crypto.randomBytes(128, onSaltComputed.bind(this));

  }

  function onSaltComputed(err, salt) {
    if(err) {
      return cb(err);
    }

    credentials.salt = salt.toString('base64');

    this._hashPassword(password, credentials.salt, onPasswordHashed.bind(this));

  }

  function onPasswordHashed(err, hash) {

    if(err) {
      return cb(err);
    }

    credentials.hash = hash;

    this._credentialsStore.put(
      username,
      credentials,
      onCredentialsSaved.bind(this)
    );

  }

  function onCredentialsSaved(err) {

    if(err) {
      return cb(err);
    }

    this._usersStore.put(user.uid, user, onUserSaved.bind(this));

  }

  function onUserSaved(err) {
    if(err) {
      return cb(err);
    }
    return cb(null, user);
  }

};

p._hashPassword = function(password, salt, cb) {
  return crypto.pbkdf2(password, salt, 12000, 512, onHashComputed);
  function onHashComputed(err, hash) {
    if(err) {
      return cb(err);
    }
    return cb(null, hash.toString('base64'));
  }
};

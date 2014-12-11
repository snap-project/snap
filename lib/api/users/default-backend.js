/* jshint node: true */
var crypto = require('crypto');

function AuthDefaultBackend(usersStore, credentialsStore) {
  this._usersStore = usersStore;
  this._credentialsStore = credentialsStore;
}

module.exports = AuthDefaultBackend;

var p = AuthDefaultBackend.prototype;

p.findUserByUid = function(uid, cb) {

  this._usersStore.get(uid, onStoreResult);
  return this;

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
  return this;

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
      return cb(null, credentials.user);
    } else {
      return cb(new Error('Invalid credentials.'));
    }

  }

};

p.save = function(user, cb) {
  this._usersStore.put(user.uid, user, cb);
  return this;
};

p.changePassword = function(username, password, cb) {

  this._credentialsStore.get(username, onCredentialsSearchResult.bind(this));
  return this;

  function onCredentialsSearchResult(err, credentials) {

    if(err) {
      return cb(err);
    }

    return this._saveCredentials(
      username, password, credentials.user,
      cb
    );

  }

};

p.register = function(username, password, user, cb) {

  this._credentialsStore.get(username, onCredentialsSearchResult.bind(this));
  return this;

  function onCredentialsSearchResult(err) {

    if(err && !err.notFound) {
      return cb(err);
    }

    if(!err) {
      return cb(new Error('Username already exist !'));
    }

    return this._saveCredentials(
      username, password, user.uid,
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

p._saveCredentials = function(username, password, userUid, cb) {

  var credentials = {
    user: userUid
  };

  this._computeSalt(onSaltComputed.bind(this));
  return this;

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
      cb
    );

  }

};

// Private methodes

p._computeSalt = function(cb) {
  crypto.randomBytes(128, cb);
  return this;
};

p._hashPassword = function(password, salt, cb) {

  crypto.pbkdf2(password, salt, 12000, 512, onHashComputed);
  return this;

  function onHashComputed(err, hash) {
    if(err) {
      return cb(err);
    }
    return cb(null, hash.toString('base64'));
  }

};

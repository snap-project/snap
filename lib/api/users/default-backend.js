/* jshint node: true */
var crypto = require('crypto');
var errors = require('./errors');
var assert = require('assert');
var levelQuery = require('level-queryengine');
var pathEngine = require('path-engine');

function UsersDefaultBackend(opts) {

  opts = opts || {};

  assert.ok(opts.usersStore, '"usersStore options must be defined !"');
  assert.ok(
    opts.credentialsStore,
    '"credentialsStore options must be defined !"'
  );

  this._opts = opts;
  this._configureStores(opts.usersStore, opts.credentialsStore);

}

module.exports = UsersDefaultBackend;

var p = UsersDefaultBackend.prototype;

p.findByUid = function(uid, cb) {

  this._usersStore.get(uid, onStoreResult);
  return this;

  function onStoreResult(err, userAttrs) {
    if(err && !err.notFound) {
      return cb(err);
    }
    return cb(null, userAttrs);
  }

};

p.findAll = function(fromUid, limit, cb) {

  var users = [];

  var vs = this._usersStore.createValueStream({
    gt: fromUid,
    limit: limit
  });

  vs.on('data', onUserData)
    .once('end', onStreamEnd)
    .once('error', onStreamError)
  ;

  return this;

  function onUserData(userAttrs) {
    users.push(userAttrs);
  }

  function onStreamEnd() {
    vs.removeAllListeners();
    return cb(null, users);
  }

  function onStreamError(err) {
    vs.removeAllListeners();
    return cb(err);
  }

};

p.validateCredentialsFormat = function(credentials) {

  if(!credentials) {
    throw new Error('Credentials must be not null !');
  }

  if(!credentials.username) {
    throw new Error('Credentials must have a "username" property !');
  }

  if(!credentials.password) {
    throw new Error('Credentials must have a "password" property !');
  }

  return this;

};

p.authenticate = function(credentials, cb) {

  var password = credentials.password;
  var username = credentials.username;

  this._credentialsStore.get(
    username,
    onStoreResult.bind(this)
  );

  return this;

  function onStoreResult(err, storedCredentials) {

    if(err && !err.notFound) {
      return cb(err);
    }

    if(!storedCredentials) {
      return cb(new errors.BadCredentials());
    }

    this._hashPassword(
      password, storedCredentials.salt,
      onHashResult.bind(this, storedCredentials)
    );

  }

  function onHashResult(storedCredentials, err, hash) {

    if(err) {
      return cb(err);
    }

    if(hash === storedCredentials.hash) {
      return cb(null, storedCredentials.user);
    } else {
      return cb(new errors.BadCredentials());
    }

  }

};

p.save = function(user, cb) {

  this._usersStore.put(user.uid, user, onUserSaved);

  function onUserSaved(err) {
    if(err) {
      return cb(err);
    }
    return cb(null, user.uid);
  }

  return this;

};

p.changeCredentials = function(uid, newCredentials, cb) {

  if(!newCredentials || !newCredentials.username || !newCredentials.password) {
    process.nextTick(cb.bind(null, new errors.InvalidCredentials()));
    return this;
  }

  var query = this._credentialsStore.query(['user', uid]);

  query.once('data', onCredentialsResult.bind(this))
    .once('error', onQueryError)
  ;

  return this;

  function onCredentialsResult(storedCredentials) {

    query.removeAllListeners();

    return this._saveCredentials(
      newCredentials.username,
      newCredentials.password,
      storedCredentials.user,
      cb
    );

  }

  function onQueryError(err) {
    query.removeAllListeners();
    return cb(err);
  }

};

p.register = function(user, credentials, cb) {

  if(!credentials || !credentials.username || !credentials.password) {
    process.nextTick(cb.bind(null, new errors.InvalidCredentials()));
    return this;
  }

  var password = credentials.password;
  var username = credentials.username;

  this._credentialsStore.get(username, onCredentialsSearchResult.bind(this));
  return this;

  function onCredentialsSearchResult(err) {

    if(err && !err.notFound) {
      return cb(err);
    }

    if(!err) {
      return cb(new errors.UserAlreadyExists(username));
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

// Private methods

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

p._configureStores = function(usersStore, credentialsStore) {

  credentialsStore = levelQuery(credentialsStore);
  credentialsStore.query.use(pathEngine());

  credentialsStore.ensureIndex('user');

  this._usersStore = usersStore;
  this._credentialsStore = credentialsStore;

};

p._computeSalt = function(cb) {
  crypto.randomBytes(128, cb);
  return this;
};

p._hashPassword = function(password, salt, cb) {

  var rounds = (this._opts.rounds || 12) * 1000;
  var keyLength = (this._opts.hashLength || 512);

  crypto.pbkdf2(password, salt, rounds, keyLength, onHashComputed);
  return this;

  function onHashComputed(err, hash) {
    if(err) {
      return cb(err);
    }
    return cb(null, hash.toString('base64'));
  }

};

/* jshint node: true */
function AuthDefaultBackend(store) {
  this._store = store;
}

module.exports = AuthDefaultBackend;

var p = AuthDefaultBackend.prototype;

p.findUserById = function(userId, cb) {
  return this._store.get(userId, cb);
};

p.authenticate = function(credentials, cb) {

  if(credentials &&
    credentials.username === 'test' &&
    credentials.password === 'test') {

    return cb(null, 'test-user-id');

  } else {
    return cb(null);
  }

};

p.register = function(user, cb) {

};

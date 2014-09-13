var util = require('util');
var Store = require('express-session').Store;

function LevelSessionStore(backend) {
  if(!backend) {
    throw new Error('You must provide a valid LevelUp store !');
  }
  this._backend = backend;
}

util.inherits(LevelSessionStore, Store);

module.exports = LevelSessionStore;

var p = LevelSessionStore.prototype;

p.get = function(sid, cb) {
  this._backend.get(sid, function(err, session) {
    return cb(null, session);
  });
  return this;
};

p.set = function(sid, session, cb) {
  this._backend.set(sid, session, cb);
  return this;
};

p.destroy = function(sid, cb) {
  this._backend.destroy(sid, cb);
  return this;
};

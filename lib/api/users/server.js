var Datastore = require('nedb');
var mkdirp = require('mkdirp');
var path = require('path');
var User = require('./user');

module.exports = function(snap) {

  // Initialize NEDB store
  var dataDir = snap.config.get('data:dir');
  
  var autoCreate = snap.config.get('data:autoCreate');
  if(autoCreate) {
    mkdirp.sync(dataDir);
  }

  var inMemoryOnly = snap.config.get('data:inMemoryOnly');
  var db = new Datastore({
    filename: path.join(dataDir, 'users.db'),
    autoload: true,
    inMemoryOnly: inMemoryOnly
  });

  var users = {};

  users.create = function(attributes) {
    return new User(db, attributes);
  };

  return users;

};
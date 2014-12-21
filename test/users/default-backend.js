/* jshint node:true */

var storageApiFactory = require('../../lib/api/storage/api');
var usersApiFactory = require('../../lib/api/users/api');
var UsersDefaultBackend = require('../../lib/api/users/default-backend');

module.exports = exports = require('./common-tests');

exports.setUp = function(done) {

  var users = usersApiFactory();
  var storage = storageApiFactory({adapter: 'memdown'});

  // Set default backend
  users.setBackend(new UsersDefaultBackend({
    usersStore: storage.getGlobalStore('users'),
    credentialsStore: storage.getGlobalStore('users_credentials')
  }));

  this.users = users;

  this.credentials1 = {
    username: 'foo',
    password: 'bar'
  };

  this.credentials2 = {
    username: 'john',
    password: 'silver'
  };

  return done();

};

exports.tearDown = function(done) {
  this.users.clearTempUsers();
  return done();
};

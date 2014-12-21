/* jshint node:true */
var levelup = require('levelup');
var path = require('path');
var assert = require('assert');

module.exports = exports = function storageAPIFactory(config) {

  config = config || {};
  var _stores = {};
  var api = {};

  function _getStore(file, adapter) {
    var s = _stores[file];
    if(!s) {
      s = levelup(file, {
        db: require(adapter || 'memdown'),
        valueEncoding: 'json'
      });
      _stores[file] = s;
    }
    return s;
  }

  // Global store: users, sessions, etc
  api.getGlobalStore = function(dbName) {
    assert.ok(dbName, 'dbName should not be empty !');
    var opts = config.global || {};
    var file = path.join(opts.dir || '', dbName + '.db');
    return _getStore(file, opts.adapter);
  };

  // App store: user specific if userId defined or shared
  api.getAppStore = function(appName, userId) {
    assert.ok(appName, 'appName should not be empty !');
    var opts = config.apps || {};
    var dbFile = (userId ? ('user-'+userId) : 'shared') + '.db';
    var file = path.join(opts.dir || '', appName, '.snap-data', dbFile);
    return _getStore(file, opts.adapter);
  };

  // Plugin store
  api.getPluginStore = function(pluginName) {
    assert.ok(pluginName, 'pluginName should not be empty !');
    var opts = config.plugins || {};
    var file = path.join(opts.dir || '', pluginName + '.db');
    return _getStore(file, opts.adapter);
  };

  return api;

};

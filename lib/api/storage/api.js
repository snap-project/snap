/* jshint node:true */
var levelup = require('levelup');
var path = require('path');
var assert = require('assert');
var levelQuery = require('level-queryengine');
var jsonQueryEngine = require('jsonquery-engine');
var mkdirp = require('mkdirp');

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
      s = levelQuery(s);
      s.query.use(jsonQueryEngine());
      _stores[file] = s;
    }
    return s;
  }

  // Global store: users, sessions, etc
  api.getGlobalStore = function(dbName) {
    assert.ok(dbName, 'dbName should not be empty !');
    var opts = config.global || {};
    var dir = opts.dir || '';
    mkdirp.sync(dir);
    var file = path.join(dir, dbName);
    return _getStore(file, opts.adapter);
  };

  // App store: user specific if userId defined or shared
  api.getAppStore = function(appName, userId) {
    assert.ok(appName, 'appName should not be empty !');
    var opts = config.apps || {};
    var dbFile = (userId ? ('user_'+userId) : 'shared');
    var dir = path.join(opts.dir || '', appName, '.snap_data');
    mkdirp.sync(dir);
    var file = path.join(dir, dbFile);
    return _getStore(file, opts.adapter);
  };

  // Plugin store
  api.getPluginStore = function(pluginName) {
    assert.ok(pluginName, 'pluginName should not be empty !');
    var opts = config.plugins || {};
    var dir = opts.dir || '';
    mkdirp.sync(dir);
    var file = path.join(dir, 'plugin_'+pluginName);
    return _getStore(file, opts.adapter);
  };

  return api;

};

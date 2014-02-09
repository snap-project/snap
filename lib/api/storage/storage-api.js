var levelup = require('levelup');
var path = require('path');

// Constructor
function StorageAPI(config) {
  this._config = config || {};
  this._stores = {};
};

module.exports = exports = StorageAPI;

var p = StorageAPI.prototype;

/* Public */

// Global store: users, sessions, etc
p.getGlobalStore = function(dbName) {
  var config = this._config.global || {};
  var file = path.join(config.dir || '', dbName + '.db');
  return this._getStore(file, config.adapter);
};

// App store: user specific if userId defined or shared
p.getAppStore = function(appName, userId) {
  var config = this._config.apps || {};
  var dbFile = (userId ? userId + '-' : '') + '.db';
  var file = path.join(config.dir || '', appName, dbFile);
  return this._getStore(file, config.adapter);
};

// Plugin store
p.getPluginStore = function(pluginName) {
  var config = this._config.plugins || {};
  var file = path.join(config.dir || '', pluginName + '.db');
  return this._getStore(file, config.adapter);
};

/* Private */

// Create new store or get it from cache
p._getStore = function(file, adapter) {
  var s = this._stores[file];
  if(!s) {
    s = levelup(file, {
      db: require(adapter || 'memdown'),
      valueEncoding: 'json'
    });
    this._stores[file] = s;
  }
  return s;
};


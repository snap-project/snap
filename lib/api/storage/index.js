var Datastore = require('nedb');
var path = require('path');

module.exports = function(snap) {

  var storage = snap.storage = {};

  var _stores = {};

  function getStore(file, inMemory, cb) {
    var s = _stores[file];
    if(!s) {
      s = new Datastore({
        filename: file,
        inMemoryOnly: inMemory,
        autoload: true
      });
      _stores[file] = s;
    }
    return s;
  };

  storage.getGlobalStore = function(dbName) {
    var config = snap.config.get('storage:global');
    var file = path.join(config.dir, dbName + '.db');
    return getStore(file, config.memory);
  };

  storage.getAppStore = function(appName) {
    var config = snap.config.get('storage:apps');
    var file = path.join(config.dir, appName, '.db');
    return getStore(file, config.memory);
  };

  storage.getPluginStore = function(pluginName) {
    var config = snap.config.get('storage:plugins');
    var file = path.join(config.dir, pluginName + '.db');
    return getStore(file, config.memory);
  };

};
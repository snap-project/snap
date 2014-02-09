var StorageAPI = require('./storage-api');

module.exports = function(snap) {
  var storageConfig = snap.config.get('storage');
  var storage = new StorageAPI(storageConfig);
  return storage;
};



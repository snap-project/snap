var apiFactory = require('./api');

module.exports = function(snap) {
  var storageConfig = snap.config.get('storage');
  var storage = apiFactory(storageConfig);
  return storage;
};



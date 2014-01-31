var api = require('./api');

module.exports = function(snap) {

  // Get users store reference
  var store = snap.storage.getGlobalStore('users');
  // Assign store to users API
  api.setStore(store);
  //Expose users API
  snap.users = api;
  
};
var api = require('./api');

module.exports = function(snap) {

  // Get users store reference
  var store = snap.storage.getGlobalStore('users');
  // Assign store to users API
  api.setStore(store);
  //Expose users API
  snap.users = api;

  //Expose getUserInfo to client
  snap.rpc.expose('users', 'getUserInfo', function(params, cb) {
    var user = this.meta.session.user;
    return cb(null, user);
  });

  snap.plugins.injectClientSide(__dirname + '/client.js');
  
};
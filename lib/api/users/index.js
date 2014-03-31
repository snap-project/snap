var usersAPIFactory = require('./api');

module.exports = function(snap) {

  // Get users store reference
  var store = snap.storage.getGlobalStore('users');
  snap.users = usersAPIFactory({store: store});

  //Expose getUserInfo to client
  snap.rpc.expose('users', 'getUserInfo', function(params, cb) {
    var user = this.meta.user;
    return cb(null, user);
  });

  snap.plugins.injectClientSide(__dirname + '/client.js');
  
};
var authApiFactory = require('./api');

module.exports = function(snap) {

  // Export Auth API
  var api = snap.auth = authApiFactory(snap.users, snap.storage);

  // Expose Auth API to RPC
  snap.rpc.expose('auth', 'getUser', function authGetUser(params, cb) {
    var user = this.get('user');
    return cb(null, user);
  });

  snap.plugins.injectClientSide(__dirname + '/client.js');

};

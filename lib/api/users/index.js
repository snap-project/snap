
module.exports = function(snap) {

  snap.server.users = require('./server')(snap);

  snap.client.inject(__dirname + '/client');

  snap.server.expose('users:getCurrentUser', function(params, cb) {
    var req = this.httpRequest;
    var user = req.session.user;
    return cb(null, user);
  });

};
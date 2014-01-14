
module.exports = function(snap) {

  snap.server.users = require('./server')(snap);

  snap.client.inject(__dirname + '/client');

  snap.server.expose('users:getCurrentUser', function(params, cb) {

    var req = this.httpRequest;
    var user = req.session.user;

    return cb(null, user);
    
  });

  snap.server.expose('users:setUserName', function(params, cb) {

    var newName = params.name || params[0];
    var req = this.httpRequest;
    var user = req.session.user;

    user.setName(newName);

    if(user.isPersistent()) {
      return user.save(cb);
    } else {
      return cb(null, user);
    }

  });

};
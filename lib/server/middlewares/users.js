/* jshint node: true */

module.exports = function(snap) {

  return function usersMiddleware(req, res, next) {
    var users = snap.server.users;
    var user = req.session.user;
    req.user = req.session.user = users.create(user);
    return next();
  };

};
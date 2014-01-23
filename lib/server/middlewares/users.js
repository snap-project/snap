/* jshint node: true */

module.exports = function(snap) {

  return function usersMiddleware(req, res, next) {
    var user = req.session.user;
    req.session.user = snap.users.create(user);
    return next();
  };

};
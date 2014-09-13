/* jshint node: true */

module.exports = function(snap) {

  return function usersMiddleware(req, res, next) {

    var userId = req.session.userId;

    if(userId) {

      snap.users.findById(userId, function(err, user) {
        if(err) {
          snap.logger.error(err);
          req.user = snap.users.create();
          req.session.userId = req.user.id;
        } else {
          req.user = user;
        }
        return next();
      });

    } else {

      req.user = snap.users.create();
      req.session.userId = req.user.id;

      return next();

    }

  };

};

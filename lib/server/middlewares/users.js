/* jshint node: true */

module.exports = function(auth) {

  function usersMiddleware(req, res, next) {

    var userId = req.session.userId;

    if(userId) {

      auth.findUserById(userId, function(err, user) {

        if(err) {
          return next(err);
        }

        if(!user) {
          user = auth.createTempUser();
        }

        req.user = user;
        req.session.userId = user.id;

        return next();

      });

    } else {

      req.user = auth.createTempUser();
      req.session.userId = req.user.id;

      return next();

    }

  }

  return usersMiddleware;

};

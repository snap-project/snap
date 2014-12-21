/* jshint node: true */

module.exports = function sessionUserMiddlewareFactory(users) {

  function sessionUserMiddleware(req, res, next) {

    var userUid = req.session.userUid;

    if(userUid) {

      users.findByUid(userUid, function(err, user) {

        if(err) {
          return next(err);
        }

        if(!user) {
          user = users.createTempUser();
        }

        req.user = user;
        req.session.userUid = user.get('uid');

        return next();

      });

    } else {

      req.user = users.createTempUser();
      req.session.userUid = req.user.get('uid');

      return next();

    }

  }

  return sessionUserMiddleware;

};

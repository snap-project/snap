/* jshint node: true */

module.exports = function(snap) {

  return function usersMiddleware(req, res, next) {

    function userHandler(err, user) {
      if(err) {
        return next(err);
      }
      if(!user) {
        user = snap.users.create();
        return req.session.set('user', user, next);
      } else {
        return next();
      }
    }

    return req.session.get('user', userHandler);

  };

};
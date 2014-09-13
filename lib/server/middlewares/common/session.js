var session = require('express-session');
var LevelSessionStore = require('./level-session-store');
var _ = require('lodash');

module.exports = function(snap, disableAutoCommit) {

  disableAutoCommit = disableAutoCommit === undefined ? true : disableAutoCommit;

  var levelUpBackend = snap.storage.getGlobalStore('session');
  var sessionConfig = snap.config.get('server:session');

  var sessionConfig = _.extend(sessionConfig, {
    store: new LevelSessionStore(levelUpBackend)
  });

  var _middleware = session(sessionConfig);

  return function sessionMiddleware(req, res, next) {
    var end = res.end
    _middleware(req, res, function(err) {
      if(disableAutoCommit) {
        res.end = end;
      }
      return next(err);
    });
  };

};

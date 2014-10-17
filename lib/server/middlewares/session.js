var expressSession = require('express-session');
var LevelSessionStore = require('./level-session-store');
var _ = require('lodash');

var singletonMiddleware;

module.exports = function snapSessionMiddlewareFactory(snap) {

  if(singletonMiddleware) {
    return singletonMiddleware;
  }

  var levelUpBackend = snap.storage.getGlobalStore('session');
  var sessionConfig = snap.config.get('server:session');

  var sessionConfig = _.extend(sessionConfig, {
    store: new LevelSessionStore(levelUpBackend)
  });

  singletonMiddleware = expressSession(sessionConfig);

  return singletonMiddleware;

};

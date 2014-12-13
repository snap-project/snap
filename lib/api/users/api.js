/* jshint node:true*/
var User = require('./user');
var logger = require('../../util/logger');
var _ = require('lodash');

var _backend;
var _tempUsers = {};

module.exports = function usersApiFactory() {

  var api = {};
  var errors = api.errors = require('./errors');

  api.setBackend = function(backend) {
    _backend = backend;
    return api;
  };

  api.getBackend = function() {
    return _backend;
  };

  api.createTempUser = function() {
    var user = new User();
    user.set('isTemporary', true);
    _tempUsers[user.get('uid')] = user.toJSON();
    return user;
  };

  api.clearTempUsers = function() {
    _tempUsers = {};
  };

  api.register = function(user, credentials, cb) {

    try {
      _backend.validateCredentialsFormat(credentials);
    } catch(err) {
      logger.error(err);
      process.nextTick(cb.bind(null,  new errors.InvalidCredentialsFormat()));
      return api;
    }

    if(!user instanceof User) {
      process.nextTick(cb.bind(null,  new errors.InvalidUser()));
      return api;
    }

    var uid = user.get('uid');

    if(uid in _tempUsers) {
      delete _tempUsers[uid];
      user.del('isTemporary');
    }

    _backend.register(
      user.toJSON(),
      credentials,
      _hydrateUser.bind(null, cb)
    );

    return api;

  };

  api.authenticate = function(credentials, cb) {

    try {
      _backend.validateCredentialsFormat(credentials);
    } catch(err) {
      logger.error(err);
      process.nextTick(cb.bind(null,  new errors.InvalidCredentialsFormat()));
      return api;
    }

    _backend.authenticate(credentials, onBackendResult);
    return api;

    function onBackendResult(err, uid) {

      if(err) {
        return cb(err);
      }

      if(uid) {
        return api.findByUid(uid, cb);
      } else {
        return cb(null, null);
      }

    }

  };

  api.changeCredentials = function(uid, credentials, cb) {

    try {
      _backend.validateCredentialsFormat(credentials);
    } catch(err) {
      logger.error(err);
      process.nextTick(cb.bind(null,  new errors.InvalidCredentialsFormat()));
      return api;
    }

    if(uid in _tempUsers) {
      process.nextTick(cb.bind(null,  new errors.TempUserCredentials()));
      return api;
    }

    _backend.changeCredentials(uid, credentials, onCredentialsChanged);

    return api;

    function onCredentialsChanged(err) {
      return cb(err);
    }

  };

  api.findByUid = function(uid, cb) {

    if(uid in _tempUsers) {
      var user = new User(_tempUsers[uid]);
      process.nextTick(cb.bind(null, null, user));
    } else {
      _backend.findByUid(uid, _hydrateUser.bind(null, cb));
    }

    return api;

  };

  api.findAll = function(fromUid, limit, cb) {

    var args = _.toArray(arguments);

    fromUid = args.length > 1 ? fromUid : '';
    limit = args.length > 2 ? limit : Number.MAX_VALUE;
    cb = args[args.length-1];

    _backend.findAll(fromUid, limit, onUsersFetched);

    function onUsersFetched(err, users) {

      if(err) {
        return cb(err);
      }

      users = users.reduce(function(memo, userAttrs) {
        try {
          var u = new User(userAttrs);
          memo.push(u);
        } catch(err) {
          logger.error(err);
        }
        return memo;
      }, []);

      var tempUsers = _.map(_tempUsers, function(user) {
        return new User(user);
      });

      users.push.apply(users, tempUsers);

      return cb(null, users);

    }

  };

  api.save = function(user, cb) {

    if(!user instanceof User) {
      process.nextTick(cb.bind(null,  new errors.InvalidUser()));
      return api;
    }

    var uid = user.get('uid');

    if(uid in _tempUsers) {
      _tempUsers[uid] = user.toJSON();
      process.nextTick(cb.bind(null, null, user));
    } else {
      _backend.save(user.toJSON(), _hydrateUser.bind(null, cb));
    }

    return api;

  };

  // Private

  // Transform raw user attributes to valid User entity
  function _hydrateUser(cb, err, userAttrs) {

    if(err) {
      return cb(err);
    }

    var user;

    if(userAttrs) {
      try {
        user = new User(userAttrs);
      } catch(err) {
        return cb(err);
      }
    }

    cb(null, user);

    return api;

  }

  return api;

};

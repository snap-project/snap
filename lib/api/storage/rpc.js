var _ = require('lodash');

module.exports = exports = function storageRPCInit(snap) {

  function appPut(app, userId, key, value, cb) {
    var store = snap.storage.getAppStore(app, userId);
    return store.put(key, value, cb);
  }

  function appGet(app, userId, key, cb) {
    var store = snap.storage.getAppStore(app, userId);
    return store.get(key, function(err, value) {
      if(err) {
        if(err.name === 'NotFoundError') {
          return cb(null, null);
        } else {
          return cb(err);
        }
      }
      return cb(null, value);
    });
  }

  function rpcMethodProxy(isGet, isShared, params, cb) {

    var app = params[0];
    var key = params[1];
    var value = params[2];
    var userId;

    //TODO assert params

    if(!isShared) {
      userId = this.meta.session.user.id;
    }
    
    if(isGet) {
      return appGet(app, userId, key, cb);
    } else {
      return appPut(app, userId, key, value, cb);
    }

  };

  snap.rpc.expose(
    'appStorage',
    'getShared',
    _.partial(rpcMethodProxy, true, true)
  );

  snap.rpc.expose(
    'appStorage',
    'putShared',
    _.partial(rpcMethodProxy, false, true)
  );

  snap.rpc.expose(
    'appStorage',
    'put',
    _.partial(rpcMethodProxy, false, false)
  );

  snap.rpc.expose(
    'appStorage',
    'get',
    _.partial(rpcMethodProxy, true, false)
  );

  snap.plugins.injectClientSide(__dirname + '/client.js');

};
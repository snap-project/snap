var _ = require('lodash');
var sift = require('sift');

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

  function appFind(app, userId, query, opts, cb) {

    var store = snap.storage.getAppStore(app, userId);
    var stream = store.createReadStream(opts);
    var results = [];
    var filter = sift(query);

    function endStreamHandler(err) {
      stream.removeAllListeners();
      if(err)  {
        return cb(err);
      }
      return cb(null, results);
    }

    stream.on('data', function(data) {
      if(filter.test(data.value)) {
        results.push(data);
      }
    });
    stream.once('error', endStreamHandler);
    stream.once('end', endStreamHandler.bind(null, null));
  }

  function appBatch(app, userId, batch, cb) {
    var store = snap.storage.getAppStore(app, userId);
    return store.batch(batch, cb);
  }

  function getPutProxy(isGet, isShared, params, cb) {

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

  }

  function findProxy(isShared, params, cb) {

    var app = params[0];
    var query = params[1];
    var opts = params[2];
    var userId;

    //TODO assert params

    if(!isShared) {
      userId = this.meta.session.user.id;
    }

    appFind(app, userId, query, opts, cb);

  }

  function batchProxy(isShared, params, cb) {

    var app = params[0];
    var batch = params[1];
    var userId;

    //TODO assert params

    if(!isShared) {
      userId = this.meta.session.user.id;
    }

    appBatch(app, userId, batch, cb);

  };

  snap.rpc.expose(
    'appStorage',
    'getShared',
    _.partial(getPutProxy, true, true)
  );

  snap.rpc.expose(
    'appStorage',
    'putShared',
    _.partial(getPutProxy, false, true)
  );

  snap.rpc.expose(
    'appStorage',
    'put',
    _.partial(getPutProxy, false, false)
  );

  snap.rpc.expose(
    'appStorage',
    'get',
    _.partial(getPutProxy, true, false)
  );

  snap.rpc.expose(
    'appStorage',
    'batch',
    _.partial(batchProxy, false)
  );

  snap.rpc.expose(
    'appStorage',
    'batchShared',
    _.partial(batchProxy, true)
  );

  snap.rpc.expose(
    'appStorage',
    'find',
    _.partial(findProxy, false)
  );

  snap.rpc.expose(
    'appStorage',
    'findShared',
    _.partial(findProxy, true)
  );

  snap.plugins.injectClientSide(__dirname + '/client.js');

};
/* jshint node: true */
var _ = require('lodash');

module.exports = exports = function storageRPCInit(snap) {

  var operations = {

    put: function(userUid, key, value, cb) {
      var currentApp = this.get('currentApp');
      var store = snap.storage.getAppStore(currentApp, userUid);
      return store.put(key, value, cb);
    },

    get: function(userUid, key, cb) {

      var currentApp = this.get('currentApp');
      var store = snap.storage.getAppStore(currentApp, userUid);

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
    },

    del: function(userUid, key, cb) {
      var currentApp = this.get('currentApp');
      var store = snap.storage.getAppStore(currentApp, userUid);
      return store.del(key, cb);
    },

    find: function(userUid, query, cb) {

      var currentApp = this.get('currentApp');

      var store = snap.storage.getAppStore(currentApp, userUid);
      var results = [];

      var stream = store.query(query || {});

      stream.on('data', onStreamData);
      stream.once('end', onStreamEnd);

      function onStreamData(doc) {
        results.push(doc);
      }

      function onStreamEnd(err) {
        stream.removeAllListeners();
        if(err)  {
          return cb(err);
        }
        return cb(null, results);
      }

    },

    batch: function(userUid, batch, cb) {
      var currentApp = this.get('currentApp');
      var store = snap.storage.getAppStore(currentApp, userUid);
      return store.batch(batch, cb);
    }

  };

  function gpdProxy(opType, isShared, params, cb) {

    var key = params[0];
    var value = params[1];
    var userUid;

    //TODO assert params

    if(!isShared) {
      userUid = this.get('user').get('uid');
    }

    switch(opType) {
      case 'put':
        return operations.put.call(this, userUid, key, value, cb);
      case 'get':
        return operations.get.call(this, userUid, key, cb);
      case 'del':
        return operations.del.call(this, userUid, key, cb);
      default:
        return cb(new Error('Illegal operation !'));
    }

  }

  function findProxy(isShared, params, cb) {

    var query = params[0];
    var userUid;

    //TODO assert params

    if(!isShared) {
      userUid = this.get('user').get('uid');
    }

    return operations.find.call(this, userUid, query, cb);

  }

  function batchProxy(isShared, params, cb) {

    var batch = params[0];
    var userUid;

    //TODO assert params

    if(!isShared) {
      userUid = this.get('user').get('uid');
    }

    return operations.batch.call(this, userUid, batch, cb);

  }

  var NS = 'appStorage';

  snap.rpc.expose(NS, 'getShared', _.partial(gpdProxy, 'get', true));
  snap.rpc.expose(NS, 'putShared', _.partial(gpdProxy, 'put', true));
  snap.rpc.expose(NS, 'delShared', _.partial(gpdProxy, 'del', true));
  snap.rpc.expose(NS, 'put', _.partial(gpdProxy, 'put', false));
  snap.rpc.expose(NS, 'get', _.partial(gpdProxy, 'get', false));
  snap.rpc.expose(NS, 'del', _.partial(gpdProxy, 'del', false));
  snap.rpc.expose(NS, 'batch', _.partial(batchProxy, false));
  snap.rpc.expose(NS, 'batchShared', _.partial(batchProxy, true));
  snap.rpc.expose(NS, 'find', _.partial(findProxy, false));
  snap.rpc.expose(NS, 'findShared', _.partial(findProxy, true));

  snap.plugins.injectClientSide(__dirname + '/client.js');

};

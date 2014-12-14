/* jshint node: true */
var _ = require('lodash');
var sift = require('sift');

module.exports = exports = function storageRPCInit(snap) {

  var operations = {

    put: function(app, userUid, key, value, cb) {
      var store = snap.storage.getAppStore(app, userUid);
      return store.put(key, value, cb);
    },

    get: function(app, userUid, key, cb) {
      var store = snap.storage.getAppStore(app, userUid);
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

    del: function(app, userUid, key, cb) {
      var store = snap.storage.getAppStore(app, userUid);
      return store.del(key, cb);
    },

    find: function(app, userUid, query, opts, cb) {
      var store = snap.storage.getAppStore(app, userUid);
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
    },


    batch: function(app, userUid, batch, cb) {
      var store = snap.storage.getAppStore(app, userUid);
      return store.batch(batch, cb);
    }

  };

  function gpdProxy(opType, isShared, params, cb) {

    var app = params[0];
    var key = params[1];
    var value = params[2];
    var userUid;

    //TODO assert params

    if(!isShared) {
      userUid = this.get('user').get('uid');
    }

    switch(opType) {
      case 'put':
        return operations.put(app, userUid, key, value, cb);
      case 'get':
        return operations.get(app, userUid, key, cb);
      case 'del':
        return operations.del(app, userUid, key, cb);
      default:
        return cb(new Error('Illegal operation !'));
    }

  }

  function findProxy(isShared, params, cb) {

    var app = params[0];
    var query = params[1];
    var opts = params[2];
    var userUid;

    //TODO assert params

    if(!isShared) {
      userUid = this.get('user').get('uid');
    }

    return operations.find(app, userUid, query, opts, cb);

  }

  function batchProxy(isShared, params, cb) {

    var app = params[0];
    var batch = params[1];
    var userUid;

    //TODO assert params

    if(!isShared) {
      userUid = this.get('user').get('uid');
    }

    return operations.batch(app, userUid, batch, cb);

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

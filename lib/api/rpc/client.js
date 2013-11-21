/* jshint browser: true */
module.exports = function(Snap) {

  var $ = Snap.$;
  var endpoint = Snap.config.baseURL + '/rpc';
  var rpc = Snap.rpc = {};

  function dummy() {};

  function wrapCallback(cb) {
    cb = cb || dummy;
    return function(xhr) {
      if(xhr.status >= 200 && xhr.status < 400) {
        var res;
        try {
          res = JSON.parse(xhr.response);
        } catch(err) {
          return cb(err);
        }
        if(res) {
          if(res.error) {
            return cb(res.error);
          } else {
            return cb(null, res.result);
          }
        } else {
          return cb(new Error('Server error')); // TODO Proper error handling
        }
      }
    }
  }

  var requestID = 0;
  rpc.call = function(fName, params, cb) {
    if(typeof params === 'function') {
      cb = params;
      params = [];
    }
    var handler = wrapCallback(cb);
    $.ajax({
      type: "POST",
      url: endpoint,
      data: {
        method: fName,
        params: params,
        id: cb ? requestID++ : undefined
      },
      complete: handler,
      dataType: 'json'
    });
    return rpc;
  };

};

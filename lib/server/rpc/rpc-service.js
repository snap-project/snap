/* jshint browser: true */
module.exports = function() {

  function RPCServiceFactory(appName, config) {

    var endpoint = config.baseURL + '/rpc';
    var rpc = {};

    rpc.call = function(fName, params, cb) {

    };

    return rpc;

  }

  this.registerService('rpc', RPCServiceFactory);

};

/* jshint node: true */
var _ = require('lodash');
var RPCInvalidMethodError = require('./errors/invalid-method-error');

var exposed = {};

exports.expose = function(fName, fn) {
  if(_.isString(fName)) {
    exposed[fName] = fn;
  } else if(_.isObject(fName)) {
    _.forEach(fName, function(fn, fName) {
      return exports.expose(fName, fn);
    });
  } else {
    throw new Error('Invalid arguments');
  }
  return exports;
};

exports.call = function(fName, params, context, cb) {
  if(arguments.length === 3) {
    cb = arguments[2];
  }
  var fn = exposed[fName];
  if(typeof fn === 'function') {
    try {
      fn.call(context, params, function callHandler(err) {
        if(err) {
          return cb(err);
        }
        var args = _.toArray(arguments);
        return cb(null, args.slice(1));
      });
    } catch(err) {
      return setImmediate(cb.bind(null, err));
    }
  } else {
    var err = new RPCInvalidMethodError(fName);
    return setImmediate(cb.bind(null, err));
  }
  return exports;
};
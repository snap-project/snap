/* jshint node: true, browser: true */

exports.isClientSide = function() {
  return 'window' in global;
};

exports.supportPostMessage = function() {
  return exports.isClientSide() &&
    typeof global.window.postMessage === 'function';
};

exports.isFrame = function() {
  return exports.isClientSide() && 'parent' in global.window;
};
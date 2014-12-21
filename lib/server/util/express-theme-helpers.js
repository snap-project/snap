/* jshint node: true */

var scripts = [
  'rpc/primus.js',
  'scripts/supervisor.js',
  'scripts/plugins.js',
  'scripts/bootstrap.js'
];

exports.requiredScripts = function() {
  return scripts.map(function(src) {
    return '<script type="text/javascript" src="' + src + '"></script>';
  }).join('\n');
};

exports.appFrame = function() {
  return '<div id="app-container"></div>';
};

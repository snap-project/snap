/* jshint node: true */
var _ = require('lodash');
module.exports = function(snap) {

  var plugins = snap.plugins = {};

  var slice = Array.prototype.slice;

  var scripts = [];
  plugins.injectClientSide = function() {
    var args = slice.call(arguments);
    scripts.push.apply(scripts, args);
  };

  plugins.getClientScripts = function() {
    return scripts.map(function(script, i) {
      var wrapper = {};
      wrapper[script] = {expose: 'snap-plugin-'+i};
      return wrapper;
    });
  };

  plugins.handlePluginsBootstrap = function(req, res) {
    var modules = _.map(scripts, function(item, i) {
        return 'snap-plugin-'+i;
      });
    res.set('Content-Type', 'text/javascript');
    var script = 'try {'
    script += JSON.stringify(modules) + '.forEach(window.require);';
    script += '} catch(err) { console.error(err); };'
    return res.send(script);
  };

};

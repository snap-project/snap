/* jshint node: true */

var armature = require('armature');
var path = require('path');
var _ = require('lodash');
var async = require('async');
var appDir = require('./util/app-dir');

/**
 * Create a new Snap application
 * @class
 */
function Snap() {

  this.config = require('./util/config');
  this.logger = require('./util/logger');

  this._pluginContainer = new armature.PluginContainer('snap', this);
  this._registerPlugins();

  require('./api')(this);
  this.server = require('./server')(this);

}

module.exports = Snap;

var p = Snap.prototype;

/**
 * Start the SNAP web server
 * @name Snap#startWebServer
 * @method
 * @param {Snap#startWebServerCallback} cb
 */
p.startWebServer = function(cb) {

  var self = this;
  var pluginContainer = this._pluginContainer;

  async.series([
    pluginContainer.loadPlugins.bind(pluginContainer),
    startListening
  ], cb);

  function startListening(next) {
    var httpServer = self.server.httpServer;
    var host = self.config.get('server:host');
    var port = self.config.get('server:port');
    self.logger.info('Listen', {host: host, port: port});
    httpServer.listen(port, host, next);
  }

};

/**
 * @callback Snap#startWebServerCallback
 * @param {error} err
 */

// Private

// Register plugins from configuration
// Plugins architecture from [Armature](https://github.com/Bornholm/armature)
// See snap/config/defaults.yaml, plugins section for configuration examples
p._registerPlugins = function() {

  var container = this._pluginContainer;
  var pluginsConfig = this.config.get('plugins') || [];

  _.forEach(pluginsConfig, pluginsConfigurationIterator);

  function pluginsConfigurationIterator(pluginConfig) {

    var pluginPath = pluginConfig.path;
    var pluginOptions = pluginConfig.opts;

    if(pluginPath && pluginPath.indexOf('.') === 0) {
      pluginPath = path.join(appDir, pluginPath);
    }

    container.use(pluginPath, pluginOptions);

  }

};

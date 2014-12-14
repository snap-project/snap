/* jshint node: true */

var App = require('armature').App;
var util = require('util');

/**
 * Create a new Snap application
 * @class
 */
function Snap() {

  // Expose application name for plugins, see Armature
  this.name = 'Snap';

  this._loadConfig();
  this._initLogger();
  this._registerPlugins();

  require('./api')(this);
  this.server = require('./server')(this);

  this.addInitSteps(
    this.loadPlugins
  );

  this.addTermSteps(
    this.unloadPlugins
  );

}

util.inherits(Snap, App);

module.exports = Snap;

var p = Snap.prototype;

/**
 * Start the SNAP web server
 * @name Snap#startWebServer
 * @method
 * @param {Snap#startWebServerCallback} cb
 */
p.startWebServer = function(cb) {

  var async = require('async');
  var app = this;

  async.series([
    app.initialize.bind(app),
    function listen(next) {
      var httpServer = app.server.httpServer;
      var expressApp = app.server.expressApp;
      var host = app.config.get('server:host');
      var port = app.config.get('server:port');
      app.logger.info('Listen', {host: host, port: port});
      httpServer.listen(port, host, next);
    }
  ], cb);

};

/**
 * @callback Snap#startWebServerCallback
 * @param {error} err
 */

// Private

// Initiate logger, see [bunyan](https://github.com/trentm/node-bunyan)
// Log all to stdout/stderr
p._initLogger = function() {
  this.logger = require('./util/logger');
};

// Load configuration, see [nconf](https://github.com/flatiron/nconf)
p._loadConfig = function() {
  this.config = require('./util/config');
};

// Register plugins from configuration
// Plugins architecture from [Armature](https://github.com/Bornholm/armature)
// See snap/config/defaults.yaml, plugins section for configuration examples
p._registerPlugins = function() {
  var _ = require('lodash');
  var app = this;
  var pluginsConfig = this.config.get('plugins') || [];
  _.forEach(pluginsConfig, function(plugin) {
    app.registerPlugin(plugin.path, plugin.options);
  });
};

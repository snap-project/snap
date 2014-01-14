var App = require('armature').App;
var util = require('util');

module.exports = Snap;

function Snap() {

  // Expose application name for plugins, see Armature
  this.name = "Snap";

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

var p = Snap.prototype;

// Public

p.startWebServer = function(cb) {

  var async = require('async');
  var app = this;

  async.series([
    app.initialize.bind(app),
    function listen(next) {
      var expressApp = app.server.expressApp;
      var host = app.config.get('server:host');
      var port = app.config.get('server:port');
      var http = require('http');
      var server = http.createServer(expressApp);
      app.logger.info('Listen', {host: host, port: port});
      server.listen(port, host, next);
    }
  ], cb)
  
};

// Private

// Initiate logger, see [Winston](https://github.com/flatiron/winston)
// Log all to stdout/stderr
p._initLogger = function() {
  
  var winston = require('winston');
  var logConfig = this.config.get('log');

  var logger = new winston.Logger({
    transports: [
      new winston.transports.Console(logConfig)
    ]
  });

  this.logger = logger;

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

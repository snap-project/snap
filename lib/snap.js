var App = require('armature').App;
var util = require('util');

module.exports = Snap;

function Snap() {

  this._loadConfig();
  this._initLogger();
  
  this.client = require('./client')(this);
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

p._loadConfig = function() {

  var path = require('path');
  var nconf = require('nconf');
  var os = require('os');
  var yamlFormat = require('./util/yaml-format');

  nconf
    .env()
    .argv();

  // Load configuration files defaults.json -> $ENV.json -> $HOSTNAME.json
  var configDir = nconf.get('configDir') || 'config';

  nconf.file('host', {
    file: path.join(configDir, os.hostname() + '.yaml'),
    format: yamlFormat
  });

  nconf.file('environment', {
    file: path.join(configDir, process.env.NODE_ENV + '.yaml'),
    format: yamlFormat
  });

  nconf.file('defaults', {
    file: path.join(configDir, 'defaults.yaml'),
    format: yamlFormat
  });

  this.config = nconf;

};

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

var App = require('armature').App;
var util = require('util');

module.exports = Snap;

function Snap() {

  this._loadConfig();
  this._initLogger();
  
  this.client = require('./client')(this);
  this.server = require('./server')(this);

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
  var app = this;
  app.initialize(function(err) {
    if(err) {
      return cb(err);
    }
    app.logger.info('Web server started');
    return cb();
  });
};


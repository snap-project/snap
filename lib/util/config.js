/* jshint node: true */

var path = require('path');
var nconf = require('nconf');
var os = require('os');
var yaml = require('js-yaml');

var format = {
  parse: yaml.load,
  stringify: yaml.dump
};

// Config hierarchy:
// env -> args -> defaults.yaml -> $ENV.yaml -> $HOSTNAME.yaml

nconf
  .env()
  .argv();

var configDir = nconf.get('configDir') || 'config';

nconf.file('host', {
  file: path.join(configDir, os.hostname() + '.yaml'),
  format: format
});

nconf.file('environment', {
  file: path.join(configDir, process.env.NODE_ENV + '.yaml'),
  format: format
});

nconf.file('defaults', {
  file: path.join(configDir, 'defaults.yaml'),
  format: format
});

module.exports = nconf;
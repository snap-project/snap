/* jshint node:true */
var bunyan = require('bunyan');
var config = require('./config');
var _ = require('lodash');

var loggerConfig = config.get('log') || {};

_.extend(loggerConfig,{
  name: 'snap'
});

var logger = bunyan.createLogger(loggerConfig);

module.exports = logger;

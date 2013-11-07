var yaml = require('js-yaml');

module.exports = exports = {
  parse: yaml.safeLoad,
  stringify: yaml.safeDump
};
var fs = require('fs');
var _ = require('lodash');

module.exports = function(snap) {

  var TEMPLATE = fs.readFileSync(__dirname + '/supervisor-template.js', 'utf8');
  var supervisorTpl = _.template(TEMPLATE);

  var supervisor = {};

  var injects = [];

  supervisor.handle = function(req, res, next) {
    res.set('Content-Type', 'text/javascript');
    res.send(supervisor.render());
  };

  supervisor.inject = function(script, data) {
    if(typeof script === 'function') {
      // script is a function
      injects.push([script, data || {}]);
    } else if(typeof script === 'string') {
      // script is a module path
      var module = require(script);
      injects.push([module, data || {}]);
    } else {
      throw new Error('Unknown script injection type !')
    }
    return supervisor;
  };

  supervisor.render = function() {
    return supervisorTpl({
      defaultApp: snap.config.get('apps:default'),
      injects: '[' + injects.map(serialize).join(',') + ']'
    });
  };

  function serialize(inject) {
    return '[' + inject[0].toString() + ',' + JSON.stringify(inject[1]) + ']';
  };

  return supervisor;

};
var fs = require('fs');
var _ = require('lodash');

module.exports = function(snap) {

  var SUPERVISOR_TEMPLATE = fs.readFileSync(
    __dirname + '/templates/supervisor.js',
    'utf8'
  );
  var INJECTS_TEMPLATE = fs.readFileSync(
    __dirname + '/templates/injects.js',
    'utf8'
  );

  var supervisorTpl = _.template(SUPERVISOR_TEMPLATE);
  var injectsTpl = _.template(INJECTS_TEMPLATE);

  var supervisor = {};

  var injects = [];
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

  supervisor.renderSupervisor = function() {
    return supervisorTpl({
      config: JSON.stringify({
        defaultApp: snap.config.get('apps:default'),
        baseURL: snap.config.get('server:baseURL') || ''
      })
    });
  };

  supervisor.renderInjections = function() {
    return injectsTpl({
      injects: '[' + injects.map(serialize).join(',') + ']'
    });
  };

  function serialize(inject) {
    return '[' + inject[0].toString() + ',' + JSON.stringify(inject[1]) + ']';
  };

  return supervisor;

};
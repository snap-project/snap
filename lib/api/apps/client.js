/* global supervisor */
supervisor
  .proxy('apps', 'getAppManifest')
  .proxy('apps', 'getAppsList');

supervisor.client.expose('apps', 'loadApp', function(params, cb) {
  var appName = params[0];
  // TODO check if appName is a real app
  supervisor.loadApp(appName);
  return cb();
});

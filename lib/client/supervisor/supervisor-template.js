(function(Snap, w) {
  
  "use strict";

  Snap.$ = w.Zepto;

  var config = <%= config %>;
  var currentApp = config.defaultApp;

  var services = {};
  Snap.registerService = function(name, serviceFactory) {
    services[name] = serviceFactory;
  };

  Snap.getCurrentApp = function() {
    return currentApp;
  };

  Snap.createSandbox = function(appName) {
    var sandbox = {};
    Object.keys(services)
      .forEach(function(serviceName) {
        sandbox[serviceName] = services[serviceName](appName, config);
      });
    return sandbox;
  };

  Snap.loadApp = function(appName) {
    appName = appName || config.defaultApp;
    currentApp = appName;
    var appFrame = w.document.getElementById('app');
    appFrame.onload = function() {
      var childWindow = appFrame.contentWindow;
      var sandbox = Snap.createSandbox(appName);
      if(typeof childWindow.startApp === 'function') {
        try {
          childWindow.startApp(sandbox);
        } catch(err) {
          // TODO: handle app initialization error
        }
      }
      childWindow.focus();
      delete appFrame.onload;
    };
    appFrame.src = '/apps/' + appName + '/';
  };

  // Process injections
  var injects = <%= injects %>;

  injects.forEach(function(inject) {
    inject[0].call(Snap, inject[1]);
  });

  // Load default app
  Snap.loadApp();

}(this.Snap ? this.Snap : this.Snap = {}, window))
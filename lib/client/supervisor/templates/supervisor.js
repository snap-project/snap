(function(Snap, w) {
  
  "use strict";

  Snap.$ = w.Zepto;

  var config = Snap.config = <%= config %>;

  var appFrame = w.document.getElementById('app');

  var services = {};
  Snap.registerService = function(name, serviceFactory) {
    services[name] = serviceFactory;
  };

  var appRegEx = /\/apps\/([^\/]+)/;
  Snap.getCurrentApp = function() {
    var results = appRegEx.exec(appFrame.contentWindow.location);
    return results[1] ? results[1] : defaultApp;
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
    appFrame.onload = injectSandbox;
    appFrame.src = '/apps/' + appName + '/';
  };

  function injectSandbox() {
    var childWindow = appFrame.contentWindow;
    var appName = Snap.getCurrentApp();
    var sandbox = Snap.createSandbox(appName);
    if(typeof childWindow.startApp === 'function') {
      try {
        childWindow.startApp(sandbox);
      } catch(err) {
        // TODO: handle app initialization error
      }
    }
    childWindow.focus();
  }

  if(Snap.injects) {
    Snap.injects.forEach(function(inject) {
      inject[0].call(null, Snap, inject[1]);
    });
  }

  // Load default app
  Snap.loadApp();

}(this.Snap ? this.Snap : this.Snap = {}, window))
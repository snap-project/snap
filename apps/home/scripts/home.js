(function(w) {

  'use strict';
  var document = w.document;
  var panel = document.getElementById('panel-1');

  var DEFAULT_ICON = 'icons/default.png';

  w.startApp = function(sandbox) {

    var currentApp = sandbox.apps.getCurrentApp();

    sandbox.apps.getAppsList(function(err, apps) {

      if(err) {
        // TODO dispatch error
      }

      apps.forEach(function(appName) {
        if(currentApp !== appName) {
          var appItem = createAppItem(appName);
          panel.appendChild(appItem);
        }
      });

    });

    var COLORS = ['lime', 'blue', 'canary', 'rose'];
    var colorIndex = 3;
    function createAppItem(appName) {

      var appItem = document.createElement('div');
      appItem.className = 'app';

      var appIcon = document.createElement('div');
      appIcon.className = 'icon ' + COLORS[(colorIndex++)%COLORS.length];
      appItem.appendChild(appIcon);

      var appLabel = document.createElement('span');
      appLabel.className = 'label';
      appLabel.innerHTML = appName;
      appItem.appendChild(appLabel);

      getAppIconURL(appName, function(err, iconURL) {
        if(err) {
          // TODO dispatch error
        }
        appIcon.style.backgroundImage = 'url(' + iconURL + ')';
      });

      appItem.onclick = loadApp.bind(null, appName);

      return appItem;
    }

    function getAppIconURL(appName, cb) {
      sandbox.apps.getAppManifest(appName, function(err, manifest) {
        if(err) {
          return cb(err);
        }
        if(manifest && manifest.icons) {
          var sizes = Object.keys(manifest.icons);
          var max = sizes.reduce(getMaxSize, 0);
          if(max > 0) {
            var iconURL = '/apps/' + appName + '/' + manifest.icons[''+max];
            return cb(null, iconURL);
          } else {
            return cb(null, DEFAULT_ICON);
          }
        } else {
          return cb(null, DEFAULT_ICON);
        }
      });
    }

    function getMaxSize(prev, curr) {
      return Math.max(+prev, +curr);
    }

    function loadApp(appName) {
      return sandbox.apps.loadApp(appName);
    };

  };

}(window))
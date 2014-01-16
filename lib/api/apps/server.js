/* jshint node: true */

var path = require('path');
var fs = require('fs');
var async = require('async');

module.exports = function(snap) {

  /**
   * Apps API
   * @alias Snap#apps
   * @namespace
   */
  var apps = {

    /**
     * Get the manifest for the given app name
     * @param {string} appName
     * @param {Snap#apps.getAppManifestCallback} cb
     */
    getAppManifest: function(appName, cb) {
      var appsRoot = snap.config.get('apps:dir');
      var appManifestPath = path.join(appsRoot, appName, 'manifest.json');
      fs.readFile(appManifestPath, {encoding: 'utf8'}, function(err, content) {
        if(err) {
          return cb(err);
        }
        try {
          var manifest = JSON.parse(content);
          return cb(null, manifest);
        } catch(err) {
          return cb(err);
        }
      });
    },

    /**
     * @callback Snap#apps.getAppManifestCallback
     * @param {error} err
     * @param {object} manifest
     */

    /**
     * Get the list of all existings apps
     * @memberOf! Snap#apps
     * @param {Snap#apps.getAppsListCallback} cb
     */
    getAppsList: function(cb) {

      var appsRoot = snap.config.get('apps:dir');

      async.waterfall([
        function listFiles(next) {
          return fs.readdir(appsRoot, next);
        },
        function filterFolders(files, next) {
          var paths = files.map(function(f) {
            return path.join(appsRoot, f);
          });
          return async.map(paths, fs.stat, function(err, stats) {
            if(err) {
              return next(err);
            }
            var foldersOnly = files.filter(function(s, i) {
              return stats[i].isDirectory();
            });
            return next(null, foldersOnly);
          });
        },
        function checkAppsManifests(folders, next) {
          async.filter(
            folders,
            function(appName, next) {
              apps.getAppManifest(appName, function(err) {
                return next(!err); //just ignore folder with bad manifest
              });
            },
            next.bind(null, null)
          );
        }
      ], cb);

    }

    /**
     * @callback Snap#apps.getAppsListCallback
     * @param {error} err
     * @param {array} apps
     */

  };

  return apps;

};
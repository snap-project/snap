/* jshint node: true */
var _ = require('lodash');
var path = require('path');

module.exports = function(grunt) {

  var NW_VERSION = '0.10.4';
  var BUILD_DIR = 'build';
  var BUILD_TARGETS = {
    linux_ia32: true,
    linux_x64: true,
    win: true,
    osx: false
  };
  var PKG = grunt.file.readJSON('package.json');
  var PKG_OVERWRITE = {
    window: {
      toolbar: false
    }
  };

  // Create build tasks options
  var buildOptions = _.merge({
    runtimeVersion: NW_VERSION
  }, BUILD_TARGETS);

  // Define copy:build tasks files
  var snapFiles = [];
  _(BUILD_TARGETS).forEach(function(isEnabled, target) {
    if(isEnabled) {
      var arch = 'ia32';
      var platform = target;
      if(platform.indexOf('linux') !== -1) {
        arch = platform.split('_')[1];
        platform = 'linux';
      }
      var dirName = PKG.name + '-' + PKG.version + '-' + platform + '-' + arch;
      var destPath = path.join(BUILD_DIR, dirName + '/');

      // Add apps to build
      snapFiles.push({src: 'apps/**', dest: destPath});

      // Add snap dependencies
      var modules = _.keys(PKG.dependencies).map(function(moduleName) {
        return path.join('node_modules', moduleName, '**');
      });
      snapFiles.push({src: modules, dest: destPath});

      // Add package.json
      snapFiles.push({src: 'package.json', dest: destPath});

      // Add main files, licence, & config
      snapFiles.push({
        src: ['index.html', 'app.js', 'config/defaults.yaml', 'LICENSE'],
        dest: destPath}
      );

    }
  });

  // Configure tasks
  grunt.initConfig({

    pkg: PKG,

    download: {
      options: {
        runtimeVersion: NW_VERSION
      }
    },

    run: {
      options: {
        nwArgs: ['.'],
        runtimeVersion: NW_VERSION
      }
    },

    build: {
      options: buildOptions
    },

    clean: {
      build: [BUILD_DIR]
    },

    copy: {
      build: {
        files: snapFiles,
        options: {
          noProcess: ['**','!package.json'],
          process: function() {
            var pkg = _.merge(PKG, PKG_OVERWRITE);
            return JSON.stringify(pkg, null, 2);
          }
        }
      }
    }

  });

  grunt.registerTask('snap:run',  ['download', 'run']);
  grunt.registerTask(
    'snap:build',
    ['download', 'clean:build', 'build', 'copy:build']
  );
  grunt.registerTask('default', ['snap:run']);

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-nw');

};

/* jshint node: true */
var _ = require('lodash');
var path = require('path');

module.exports = function(grunt) {

  var NW_VERSION = '0.11.6';
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

    if(!isEnabled) {
      return;
    }

    var arch = 'ia32';
    var platform = target;
    if(platform.indexOf('linux') !== -1) {
      arch = platform.split('_')[1];
      platform = 'linux';
    }
    var dirName = PKG.name + '-' + PKG.version + '-' + platform + '-' + arch;
    var destPath = path.join(BUILD_DIR, dirName + '/');

    // Add lib
    snapFiles.push({src: 'lib/**', dest: destPath});

    // Add themes
    snapFiles.push({src: 'themes/**', dest: destPath});

    // Add apps to build
    snapFiles.push({src: 'apps/**', dest: destPath});

    // Add snap dependencies
    var modules = _.map(PKG.dependencies, function(version, moduleName) {
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

  });

  // Apps with bower dependencies
  var bowerApps = [
    'apps/chat',
    'apps/home',
    'apps/user_profile',
    'themes/default'
  ];

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
    },

    shell: {
      'bower-install': {
        command: _.map(bowerApps, function(appPath) {
          return 'cd "'+path.join(process.cwd(), appPath)+'"; bower install';
        }).join('&&')
      },
      options: {
        execOptions: {
          cwd: process.cwd(),
          failOnError: true
        }
      }
    }

  });

  grunt.registerTask('snap:run',  ['download', 'run']);
  grunt.registerTask(
    'snap:build',
    ['download', 'shell:bower-install', 'clean:build', 'build', 'copy:build']
  );
  grunt.registerTask('default', ['snap:run']);

  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-nw');

};

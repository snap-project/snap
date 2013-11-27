/* jshint node: true */
module.exports = function(grunt) {

  var NW_VERSION = '0.8.0';

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    run: {
      options: {
        nwArgs: ['.'],
        downloadDir: 'node-webkit',
        runtimeVersion: NW_VERSION,
        forceDownload: false,
        forceExtract: false
      }
    },

    build: {
      options: {
        runtimeVersion: NW_VERSION,
        forceDownload: false,
        forceExtract: false,
        linux_ia32: false,
        linux_x64: true,
        win: false,
        mac: false
      }
    },

    jshint: {
      files: ['src/**/*.js', 'tasks/**/*.js', 'Gruntfile.js'],
      options: {
        jshintrc: true
      }
    },

    nodewebkit: {
      options: {
        runtimeVersion: NW_VERSION,
        build_dir: './build',
        mac: false,
        win: true,
        linux32: false,
        linux64: true
      },
      src: ['package.json', './src/**/*', './config/**/*', './apps/**/*', 'node_modules/snap-lib/**/*']
    }


  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-node-webkit-builder');

};
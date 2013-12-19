/* jshint node: true */
module.exports = function(grunt) {

  var NW_VERSION = '0.8.0';

  grunt.initConfig({
    
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
        downloadDir: 'node-webkit',
        runtimeVersion: NW_VERSION,
        forceDownload: false,
        forceExtract: false,
        linux_ia32: false,
        linux_x64: false,
        win: true,
        mac: false
      }
    },

    jshint: {
      files: ['src/**/*.js', 'tasks/**/*.js', 'Gruntfile.js'],
      options: {
        jshintrc: true
      }
    }


  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-node-webkit-builder');

};
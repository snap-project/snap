/* jshint node: true */
module.exports = function(grunt) {

  var NW_VERSION = '0.8.3';

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
        linux_ia32: true,
        linux_x64: true,
        win: false,
        osx: false
      }
    },

    jshint: {
      files: ['src/**/*.js', 'tasks/**/*.js'],
      options: {
        jshintrc: true
      }
    }


  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-jshint');

};
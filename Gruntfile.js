/* jshint node: true */
module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    'run-nw': {
      options: {
        nwArgs: ['.'],
        nodeWebkitDir: 'node-webkit',
        version: '0.8.0',
        forceDownload: false
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

};
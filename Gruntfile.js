/* jshint node: true */
module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: ['lib/**/*.js', 'Gruntfile.js'],
      options: {
        jshintrc: true
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

};
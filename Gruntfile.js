/* jshint node: true */
module.exports = function(grunt) {
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: ['lib/**/*.js'],
      options: {
        jshintrc: true
      }
    },

    jsdoc : {
      dist : {
        src: ['README.md', 'lib/**/*.js', 'test/**/*.js'], 
        options: {
          destination: 'doc',
          template: 'node_modules/grunt-jsdoc/node_modules/ink-docstrap/template',
          configure: 'jsdoc.conf.json'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsdoc');

};
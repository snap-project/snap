/* jshint node: true */
module.exports = function(grunt) {

  var NW_VERSION = '0.8.1';

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    'run-nw': {
      options: {
        nwArgs: ['.'],
        nodeWebkitDir: 'node-webkit',
        version: NW_VERSION,
        forceDownload: false
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
          version: NW_VERSION,
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
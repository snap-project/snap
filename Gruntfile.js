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
    }

  });

  grunt.loadTasks('tasks');

};
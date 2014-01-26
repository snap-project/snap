/* jshint node: true */
module.exports = function(grunt) {

  var NW_VERSION = '0.8.3';

  // linudev.so.0 workaround, see README.md
  process.env.LD_LIBRARY_PATH = '.:' + process.env.LD_LIBRARY_PATH;

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
        linux_x64: true,
        win: false,
        osx: false
      }
    }


  });

  grunt.loadTasks('tasks');

};
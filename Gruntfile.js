/* jshint node: true */
module.exports = function(grunt) {

  var NW_VERSION = '0.9.2';

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
        linux_ia32: true,
        linux_x64: true,
        win: true,
        osx: false,
        packageOverride: {
          window: {
            toolbar: false
          }
        }
      }
    }


  });

  grunt.loadTasks('tasks');

};
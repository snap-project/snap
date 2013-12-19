/* jshint node: true */
var os = require('os');
var async = require('async');
var path = require('path');
var extract = require('./lib/extract');
var spawn = require('child_process').spawn;

module.exports = function(grunt) {

  grunt.registerTask('run', 'Run SNAP Application', buildTask);

  function buildTask() {

    var nw = require('./lib/node-webkit')(grunt);
    var util = require('./lib/util')(grunt);

    var task = this;
    var done = task.async();

    var runnables = {
      linux: 'nw',
      osx: 'node-webkit.app/Contents/MacOS/node-webkit',
      windows: 'nw.exe'
    };

    var options = this.options({
      buildDir: 'build',
      downloadDir: 'node-webkit',
      runtimeVersion: '0.8.0',
      downloadURL: 'https://s3.amazonaws.com/node-webkit',
      forceDownload: true,
      forceExtract: true
    });

    nw
      .setDownloadDir(options.downloadDir)
      .setDownloadRootURL(options.downloadURL);

    var platform = os.platform();
    var arch = os.arch();

    async.waterfall([
      util.checkAndDownloadArchive.bind(options, platform, arch),
      util.extractArchive.bind(options),
      runSNAP
    ], done);

    function runSNAP(archivePath, cb) {

      var binariesDir = nw.getNWBinariesDir(archivePath);

      var nwPath = path.join(binariesDir, runnables[platform]);

      grunt.log.writeln(
        'Running "' + nwPath + ' ' +
        options.nwArgs.join(' ')+'"'
      );

      var exec = spawn(nwPath, options.nwArgs);
      exec.stdout.pipe(process.stdout);
      exec.stderr.pipe(process.stderr);
      exec.once('close', cb.bind(null, null));

    }

  }

};
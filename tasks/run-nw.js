/* jshint node: true */
var os = require('os');
var path = require('path');
var async = require('async');

var TGZ = '.tar.gz';
var ZIP = '.zip';

module.exports = function(grunt) {
  grunt.registerTask(
    'run-nw',
    'download node-webkit if necessary then run snap',
    function() {

      var done = this.async();

      var archiveNameTpl = 'node-webkit' +
        '-v<%= version %>' +
        '-<%= platform %>' +
        '-<%= arch %><%= archiveExt %>';
      var URLTpl = '<%= downloadURL %>v<%= version %>/' + archiveNameTpl;

      var platform = os.platform();
      var arch = os.arch();
      var isLinux = !!~os.platform().indexOf('linux');

      var runnables = {
        linux: 'nw',
        osx: 'node-webkit.app/Contents/MacOS/node-webkit',
        windows: 'nw.exe'
      };

      var options = this.options({
        nodeWebkitDir: 'node-webkit',
        version: '0.7.5',
        downloadURL: 'https://s3.amazonaws.com/node-webkit/',
        forceDownload: false,
        platform: platform,
        arch: arch,
        archiveExt: isLinux ? TGZ : ZIP,
        nwArgs: ['.']
      });

      var nwBinURL = grunt.template.process(URLTpl, {data: options});
      var archiveName = grunt.template.process(archiveNameTpl, {data: options});
      var archivePath = path.join(options.nodeWebkitDir, archiveName);
      var binariesDir = path.join(
        options.nodeWebkitDir,
        path.basename(archivePath, isLinux ? TGZ : ZIP)
      );

      async.series([

        function createNWDir(next) {
          if(options.forceDownload) {
            grunt.file.delete(options.nodeWebkitDir);
          }
          grunt.file.mkdir(options.nodeWebkitDir);
          return next();
        },

        function downloadNWBinaries(next) {

          var download = require('./lib/download')(grunt);

          var archiveExists = grunt.file.exists(archivePath);

          if(!archiveExists || options.forceDownload) {
            return download(nwBinURL, archivePath, next);
          } else {
            grunt.log.writeln('Binaries already downloaded !');
            return next();
          }
        },

        function extractArchive(next) {

          var fs = require('fs');
          var zlib = require('zlib');
          var tar = require('tar');
          var unzip = require('unzip');
          

          var alreadyExtracted = grunt.file.exists(binariesDir);

          if(alreadyExtracted) {
            grunt.log.writeln('Binaries already extracted !');
            return next();
          }

          var archiveStream = fs.createReadStream(archivePath);

          var opts = {
            path: options.nodeWebkitDir
          };

          grunt.log.writeln('Extracting binaries...');
          if(isLinux) {
            return archiveStream
              .pipe(zlib.createGunzip())
              .pipe(tar.Extract(opts))
              .on('end', next.bind(null, null))
              .on('error', next);
          } else {
            return archiveStream
              .pipe(unzip.Extract(opts))
              .on('end', next.bind(null, null))
              .once('error', next);
          }

        },

        function runSNAP(next) {

          var spawn = require('child_process').spawn;
          var nwPath = path.join(binariesDir, runnables[platform]);

          grunt.log.writeln(
            'Running "' + nwPath + ' ' +
            options.nwArgs.join(' ')+'"'
          );
          var nw  = spawn(nwPath, options.nwArgs);

          nw.stdout.pipe(process.stdout);
          nw.stderr.pipe(process.stderr);

          nw.once('close', next.bind(null, null));

        }

      ], done);

    }
  );
};
var async = require('async');
var path = require('path');
var fs = require('fs');

module.exports = function(grunt) {

  grunt.registerTask('build', 'Build SNAP Application', buildTask);

  function buildTask() {

    var nw = require('./lib/node-webkit')(grunt);
    var util = require('./lib/util')(grunt);


    var task = this;
    var done = task.async();

    var pkg = grunt.file.readJSON('package.json');
    var options = this.options({
      buildDir: 'build',
      downloadDir: 'node-webkit',
      appsDir : 'apps',
      configFiles: 'config/defaults.yaml',
      runtimeVersion: '0.8.0',
      downloadURL: 'https://s3.amazonaws.com/node-webkit',
      forceDownload: true,
      forceExtract: true,
      linux_ia32: true,
      linux_x64: true,
      win: true,
      mac: true
    });

    nw
      .setDownloadDir(options.downloadDir)
      .setDownloadRootURL(options.downloadURL);


    var platforms = 'linux_x64 linux_ia32 win mac'.split(' ');
    async.forEachSeries(platforms, buildForPlatform, done);

    function buildForPlatform(platform, cb) {

      if(options[platform]) {

        grunt.log.writeln('Building for platform ' + platform + '...');

        var arch = 'ia32';
        var isLinux = !!~platform.indexOf('linux');
        if(isLinux) {
          arch = platform.split('_')[1];
          platform = 'linux';
        }

        var steps = {

          common: [

            util.checkAndDownloadArchive.bind(options, platform, arch),
            util.extractArchive.bind(options),

            function createBuildDir(archivePath, next) {
              var appDir = 'snap-' +
                pkg.version + '-' +
                platform + '-' +
                arch;

              var buildDir = path.join(options.buildDir, appDir);
              if(grunt.file.exists(buildDir)) {
                grunt.file.delete(buildDir);
              }
              grunt.file.mkdir(buildDir);
              return next(null, buildDir);
            },

            function copyBinaries(buildDir, next) {
              var archivePath = nw.getNWArchivePath(options.runtimeVersion, platform, arch);
              var binariesDir = nw.getNWBinariesDir(archivePath);
              copyTree(binariesDir + '/**', buildDir);
              return next(null, buildDir);
            },

            function copyApps(buildDir, next) {
              var appsDir = options.appsDir;
              copyTree(appsDir + '/**', buildDir + '/apps/');
              return next(null, buildDir);
            },

            function copyConfig(buildDir, next) {
              var configFiles = options.configFiles;
              copyTree(configFiles, buildDir + '/config/');
              return next(null, buildDir);
            },

            function copySNAPLib(buildDir, next) {
              copyTree('node_modules/snap-lib/**', buildDir + '/node_modules/snap-lib');
              return next(null, buildDir);
            },

            function copyCommonFiles(buildDir, next) {
              grunt.file.copy('package.json', path.join(buildDir, 'package.json'));
              copyTree('bootstrap/**', buildDir + '/bootstrap/');
              return next(null, buildDir);
            }
          ],

          mac: [],
          win: [],
          linux: [

            function renameExec(buildDir, next) {
              var nwPath = path.join(buildDir, 'nw');
              var snapPath = path.join(buildDir, 'snap');
              fs.renameSync(nwPath, snapPath);
              return next(null, buildDir);
            },

            function chmod(buildDir, next) {
              var nwPath = path.join(buildDir, 'snap');
              fs.chmodSync(nwPath, '0755');
              return next(null, buildDir);
            },


            function removeNWSnapshot(buildDir, next) {
              var snapshotPath = path.join(buildDir, 'nwsnapshot');
              grunt.file.delete(snapshotPath);
              return next(null, buildDir);
            }

          ]

        };

        return async.waterfall(steps.common.concat(steps[platform]), cb);

      } else {
        return cb();
      }
    }

    function copyTree(src, dest) {
      var files = grunt.file.expand(src);
      files.forEach(function(f) {
        if(!grunt.file.isDir(f)) {
          var relPath = path.relative(path.dirname(src), f);
          var realDest = path.join(dest, relPath);
          grunt.file.copy(f, realDest);
        }
      });
    }

  }

};
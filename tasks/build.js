var async = require('async');
var _ = require('lodash');
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
      osx: true,
      packageOverride: {}
    });

    nw
      .setDownloadDir(options.downloadDir)
      .setDownloadRootURL(options.downloadURL);


    var platforms = 'linux_x64 linux_ia32 win osx'.split(' ');
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

            function copyModules(buildDir, next) {
              copyTree('node_modules/**', buildDir + '/node_modules');
              return next(null, buildDir);
            },

            function copyCommonFiles(buildDir, next) {
              grunt.file.copy('package.json', path.join(buildDir, 'package.json'));
              grunt.file.copy('index.html', path.join(buildDir, 'index.html'));
              grunt.file.copy('app.js', path.join(buildDir, 'app.js'));
              return next(null, buildDir);
            },

            function overridePackageJSON(buildDir, next) {
              var packageFile = path.join(buildDir, 'package.json');
              var nwPackage = grunt.file.readJSON(packageFile);
              _.merge(nwPackage, options.packageOverride);
              grunt.file.write(packageFile, JSON.stringify(nwPackage, null, 2));
              return next(null, buildDir);
            }

          ],

          osx: [],
          win: [

            function renameExec(buildDir, next) {
              var nwPath = path.join(buildDir, 'nw.exe');
              var snapPath = path.join(buildDir, 'snap.exe');
              fs.renameSync(nwPath, snapPath);
              return next(null, buildDir);
            }

          ],
          linux: [

            // Workaround libudev.so.0
            function addWrapper(buildDir, next) {
              copyTree('tasks/build-res/linux/**', buildDir);
              var currentWrapper = path.join(buildDir, 'app-wrapper.sh');
              var dest = path.join(buildDir, 'snap');
              fs.renameSync(currentWrapper, dest);
              return next(null, buildDir);
            },

            function renameExec(buildDir, next) {
              var nwPath = path.join(buildDir, 'nw');
              var snapPath = path.join(buildDir, 'snap-bin');
              fs.renameSync(nwPath, snapPath);
              return next(null, buildDir);
            },

            function makeExecutable(buildDir, next) {
              var files = ['snap', 'snap-bin'];
              files.forEach(function(file) {
                var nwPath = path.join(buildDir, file);
                fs.chmodSync(nwPath, '0755');
              });
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
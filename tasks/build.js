var async = require('async');
var path = require('path');

module.exports = function(grunt) {

  grunt.registerTask('build', 'Build SNAP Application', buildTask);

  function buildTask() {

    var nw = require('./lib/node-webkit')(grunt);
    var util = require('./lib/util')(grunt);

    var task = this;
    var done = task.async();

    var options = this.options({
      buildDir: 'build',
      downloadDir: 'node-webkit',
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

        var arch = 'ia32';
        var isLinux = !!~platform.indexOf('linux');
        if(isLinux) {
          arch = platform.split('_')[1];
          platform = 'linux';
        }

        return async.waterfall([

          util.checkAndDownloadArchive.bind(task, platform, arch),
          util.extractArchive.bind(task),

          function createBuildDir(archivePath, next) {
            var appDir = 'snap_' + platform + '_' + arch;
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
            var files = grunt.file.expand(binariesDir + '/**');
            files.forEach(function(f) {
              grunt.file.copy(f, buildDir+'/');
            });
            return next(null, buildDir);
          }

        ], cb);

      } else {
        return cb();
      }
    }

  }

};
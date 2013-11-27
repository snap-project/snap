var extract = require('./extract');

module.exports = function(grunt) {

  var nw = require('./node-webkit')(grunt);

  var util = {};

  util.checkAndDownloadArchive = function(platform, arch, cb) {

    var opts = this.options();
    var version = opts.runtimeVersion;
    var alreadyDownloaded = nw.isNWArchiveDownloaded(version, platform, arch);
    var archivePath = nw.getNWArchivePath(version, platform, arch);

    if(!alreadyDownloaded || opts.forceDownload) {
      if(alreadyDownloaded) {
        grunt.log.writeln('Forcing download...');
        grunt.file.delete(archivePath);
      }
      return nw.downloadNWArchive(version, platform, arch, cb);
    } else {
      grunt.log.writeln('Archive already downloaded !');
      return cb(null, archivePath);
    }

  }

  util.extractArchive = function(archivePath, cb) {
   
    var opts = this.options();

    var binariesDir = nw.getNWBinariesDir(archivePath);
    var alreadyExtracted = grunt.file.exists(binariesDir);

    if(alreadyExtracted && !opts.forceExtract) {
      grunt.log.writeln('Binaries already extracted !');
      return cb(null, archivePath);
    } else {
      if(alreadyExtracted) grunt.file.delete(binariesDir);
      grunt.log.writeln('Extracting binaries. Please wait...');
      if(archivePath.indexOf(extract.TGZ)) {
        return extract.tgz(archivePath, opts.downloadDir, cb);
      } else {
        return extract.zip(archivePath, opts.downloadDir, cb);
      }
    }
  }

  return util;

}


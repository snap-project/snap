var extract = require('./extract');

module.exports = function(grunt) {

  var nw = require('./node-webkit')(grunt);

  var util = {};

  util.checkAndDownloadArchive = function(platform, arch, cb) {

    var version = this.runtimeVersion;
    var alreadyDownloaded = nw.isNWArchiveDownloaded(version, platform, arch);
    var archivePath = nw.getNWArchivePath(version, platform, arch);

    if(!alreadyDownloaded || this.forceDownload) {
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

    var binariesDir = nw.getNWBinariesDir(archivePath);
    var alreadyExtracted = grunt.file.exists(binariesDir);

    if(alreadyExtracted && !this.forceExtract) {
      grunt.log.writeln('Binaries already extracted !');
      return cb(null, archivePath);
    } else {
      if(alreadyExtracted) grunt.file.delete(binariesDir);
      grunt.log.writeln('Extracting binaries. Please wait...');
      if(archivePath.indexOf(extract.TGZ) !== -1) {
        return extract.tgz(archivePath, this.downloadDir, cb);
      } else {
        return extract.zip(archivePath, this.downloadDir, cb);
      }
    }
  }

  return util;

}


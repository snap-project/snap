var async = require('async');
var path = require('path');
var extract = require('./extract');

var rootURL = '';
var downloadDir = '';

module.exports = function(grunt) {

  var ARCHIVE_NAME_TPL = 'node-webkit' +
        '-v<%= version %>' +
        '-<%= platform %>' +
        '-<%= arch %><%= ext %>';
  var URL_TPL = '<%= rootURL %>/v<%= version %>/<%= archiveName %>';

  var download = require('./download')(grunt);
  var nw = {};

  nw.setDownloadRootURL = function(url) {
    rootURL = url;
    return nw;
  };

  nw.setDownloadDir = function(path) {
    downloadDir = path;
    return nw;
  };

  nw.getNWArchiveName = function(version, platform, arch) {
    var isLinux = !!~platform.indexOf('linux');
    return grunt.template.process(ARCHIVE_NAME_TPL, {
      data: {
        version: version,
        platform: platform,
        arch: arch,
        ext: isLinux ? extract.TGZ : extract.ZIP
      }
    });
  };

  nw.getNWBinariesDir = function(archivePath) {
    var isLinux = !!~archivePath.indexOf('linux');
    return path.join(
      downloadDir,
      path.basename(archivePath, isLinux ? extract.TGZ : extract.ZIP)
    );
  };

  nw.getNWArchivePath = function(version, platform, arch) {
    var archiveName = nw.getNWArchiveName(version, platform, arch);
    return path.join(downloadDir, archiveName);
  };

  nw.getNWArchiveURL = function(version, platform, arch) {
    var archiveName = nw.getNWArchiveName(version, platform, arch);
    return grunt.template.process(URL_TPL, {
      data: {
        rootURL: rootURL,
        version: version,
        archiveName: archiveName
      }
    });
  };

  nw.downloadNWArchive = function(version, platform, arch, cb) {
    var downloadURL = nw.getNWArchiveURL(version, platform, arch);
    var archivePath = nw.getNWArchivePath(version, platform, arch);
    grunt.file.mkdir(downloadDir);
    download(downloadURL, archivePath, cb);
    return nw;
  };

  nw.isNWArchiveDownloaded = function(version, platform, arch) {
    var archivePath = nw.getNWArchivePath(version, platform, arch);
    return grunt.file.exists(archivePath);
  };

  return nw;

};


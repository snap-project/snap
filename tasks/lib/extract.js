var fs = require('fs');
var zlib = require('zlib');
var tar = require('tar');
var unzip = require('unzip');

exports.TGZ = '.tar.gz';
exports.ZIP = '.zip';

function extract(type, archivePath, destDir, cb) {
  var stream = fs.createReadStream(archivePath);
  var opts = {
    path: destDir
  };
  switch(type) {
    case exports.TGZ:
      return stream
        .pipe(zlib.createGunzip())
        .pipe(tar.Extract(opts))
        .once('end', cb.bind(null, null, archivePath))
        .once('error', cb);
    break;
    case exports.ZIP:
      return stream
        .pipe(unzip.Extract(opts))
        .once('end', cb.bind(null, null, archivePath))
        .once('error', cb);
    break;
    default:
      throw new Error('Invalid archive type !');
  };
}

exports.zip = extract.bind(null, exports.ZIP);
exports.tgz = extract.bind(null, exports.TGZ);
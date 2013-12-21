var path = require('path');
var spawn = require('child_process').spawn;

exports.TGZ = '.tar.gz';
exports.ZIP = '.zip';

function extract(type, archivePath, destDir, cb) {
  var child;
  switch(type) {
    case exports.TGZ:
      child = spawn('tar', ['-xzf', archivePath, '-C', destDir]);
      break;
    case exports.ZIP:
      var subDir = path.basename(archivePath, type);
      destDir = path.join(destDir, subDir);
      child = spawn('unzip', [archivePath, '-d', destDir]);
      break;
    default:
      return cb(new Error('Invalid archive type !'));
  }
  process.stdin.pipe(child.stdin);
  child.stdout.pipe(process.stdout, {end: true});
  child.stderr.pipe(process.stderr, {end: true});
  child.once('close', function(code) {
    if(code !== 0) {
      return cb(new Error('Error while extracting !'));
    }
    return cb(null, archivePath);
  });
}

exports.zip = extract.bind(null, exports.ZIP);
exports.tgz = extract.bind(null, exports.TGZ);
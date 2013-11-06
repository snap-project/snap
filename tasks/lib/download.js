/* jshint node: true */

var http = require('http');
var https = require('https');
var fs = require('fs');
var parse = require('url').parse;

module.exports = function(grunt) {

  return function download(url, file, cb) {

    grunt.log.writeln('Downloading ' + url);

    var protocol = parse(url).protocol;
    var client = protocol === 'http:' ? http : https;

    var fileStream = fs.createWriteStream(file);

    client.get(url, function(res) {

      var contentLength = res.headers['content-length'];
      grunt.log.writeln('File size is ' + contentLength + ' bytes.');
      grunt.log.writeln('Saving to ' + file);

      var downloaded = 0;
      res.on('data', function(chunk) {
        downloaded += chunk.length;
        var percent = (downloaded/contentLength)*100;
        grunt.log.write('\033[0G');
        grunt.log.write('\033[K');
        grunt.log.write('Downloaded ' + percent.toFixed(2) + '%');
        if(downloaded >= contentLength) {
          grunt.log.writeln();
        }
      });

      res.on('end', cb.bind(null, null));
      res.once('error', cb);
      res.pipe(fileStream);

    });

  };

};
#!/usr/bin/env node

var program = require('commander');
var pkg = require('../package');
var fs = require('fs');
var path = require('path');
var cwd = process.cwd();
var file = path.join(cwd, '.bestrc');

var best = require('../');

program
  .version(pkg.version)
  .option('--debug', '-D', 'Don\'t overwrite the `.eslintrc` file')
  .parse(process.argv);

function read(cb) {
  fs.access(file, fs.R_OK | fs.W_OK, function(err) {
    if (err) return cb(err);

    fs.readFile(file, function(_err, _file) {
      if (_err) return cb(_err);

      try {
        return cb(null, JSON.parse(_file));
      } catch (e) {
        return cb(e);
      }
    });
  });
}

read(function(err, config) {
  if (err) {
    console.log(err);
    process.exit(-1);
  }

  best(config);
});

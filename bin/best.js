#!/usr/bin/env node

var program = require('commander');
var pkg = require('../package');
var fs = require('fs');
var path = require('path');
var cwd = process.cwd();
var file = path.join(cwd, '.bestrc');
var _ = require('lodash');
var colors = require('colors/safe');

var best = require('../');

program
  .version(pkg.version)
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

  best(config, function(_err, rules) {
    if (_err) console.log(_err);

    var failures = _.find(rules, { success: false });
    if (!failures) return process.exit(0);

    _.each(rules, function(rule) {
      if (rule.success) return;
      var error = [ '\u00D7', rule.name ];
      if (rule.errors) error = error.concat([ rule.errors, 'failures' ]);
      console.log(colors.bold.red(error.join(' ')));
    });

    process.exit(-1);
  });
});

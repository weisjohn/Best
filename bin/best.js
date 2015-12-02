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
  .option('-o, --output', 'Produce JSON results')
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

function filter_success(rules, success) {
  return _(rules).where({ pass: success })
    .map(function(item) {
      return _.omit(item, 'pass');
    }).value();
}

read(function(err, config) {
  if (err) {
    console.log(err);
    process.exit(-1);
  }

  best(config, function(_err, rules) {
    if (_err) console.log(_err);

    var fail = filter_success(rules, false);
    var pass = filter_success(rules, true);

    // allow structured output for reporting
    if (program.output) {
      console.log(JSON.stringify({ fail: fail, pass: pass }, null, 2));
      return process.exit(0);
    }

    // use like a build tool
    if (!fail.length) return process.exit(0);

    // output for errors
    _.each(rules, function(rule) {
      if (rule.pass) return;
      var error = [ '\u00D7', rule.name ];
      if (rule.errors) error = error.concat([ rule.errors, 'failures' ]);
      console.log(colors.bold.red(error.join(' ')));
    });

    process.exit(-1);
  });
});

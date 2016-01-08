#!/usr/bin/env node

var program = require('commander');
var pkg = require('../package');
var fs = require('fs');
var path = require('path');
var cwd = process.cwd();
var file = path.join(cwd, '.bestrc');
var _ = require('lodash');
var colors = require('colors/safe');
var util = require('util');

var best = require('../');

program
  .version(pkg.version)
  .option('-o, --output', 'Produce JSON results');

var configKeys = [ 'url' ];
configKeys.forEach(function(key) {
  program.option('--' + key + ' [value]', 'Override ' + key + ' config');
});

program.parse(process.argv);

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

  // only warn if there is a .bestrc and it's not well formed
  if (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error reading .bestrc', err);
    }
    config = {};
  }

  // combine config with program
  configKeys.forEach(function(key) {
    if (program[key]) config[key] = program[key];
  });

  best(config, function(_err, results) {
    // if there's an error, bolt
    if (_err) {
      console.log(_err);
      process.exit(-1);
    }

    // allow structured output for reporting
    if (program.output) {
      results.config = config;
      console.log(JSON.stringify(results, null, 2));
      return process.exit(0);
    }

    // use like a build tool
    if (!results || !results.fail.length) return process.exit(0);

    // show failed rules, along with a count and the errors
    _.each(results.fail, function(rule) {
      var message = [ '\u00D7', rule.name ];

      // errors should be an array
      if (rule.errors && !_.isArray(rule.errors)) {
        rule.errors = [rule.errors];
      }

      // if there are a count of errors, include that in the rule line
      if (rule.errors) {
        var len = rule.errors.length;
        var pluralized = 'failure' + (len === 1 ? '' : 's');
        message = message.concat([ '-', len, pluralized ]);
      }

      console.log(colors.bold.red(message.join(' ')));

      // show each particular error within that rule
      if (rule.errors) {
        rule.errors.forEach(function(__err) {
          console.log('  ' + __err);
        });
      }
    });

    process.exit(-1);
  });
});

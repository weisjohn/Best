
var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('lodash');
var debug = require('debug')('best:rules');

// find the rules, filter unimportant rules, require them
function findRules(cb) {
  var rulesDir = path.join(__dirname, 'rules');

  fs.readdir(rulesDir, function(err, files) {
    var _files = _(files).filter(function(file) {
      // ignore non JS files
      return /\.js$/.test(file);
    }).map(function(file) {
      return {
        name: file.replace(/\.js$/, ''),
        module: require(path.join(rulesDir, file)),
      };
    }).value();

    debug('found: ' + _files.length);
    cb(err, _files);
  });
}

function best(config, cb) {
  // TODO: allow extra rules to be passed in

  findRules(function(err, rules) {
    if (err) console.log(err);

    // run the rule
    async.eachSeries(rules, function(rule, _cb) {

      // ignore rules which are not needed based on config
      rule.config = config.rules[rule.name];
      if (_.isArray(rule.config) && rule.config[0] === 0) {
        rule.skipped = true;
        debug('ignore ' + rule.name);
        return cb();
      }

      debug('invoke ' + rule.name);
      rule.module(config, function(_err, results) {
        if (_err) return cb(_err);

        // capture response from the rule invoke
        rule.pass = results.pass;
        rule.errors = results.errors;

        var msg = rule.pass ? 'succeded' : 'failed';
        debug('finish ' + rule.name + ' ' + msg);
        _cb();
      });

    }, function(_err) {
      cb(_err, rules);
    });
  });
}

module.exports = best;

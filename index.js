
var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('lodash');
var debug = require('debug')('best');

// find the rules, filter unimportant rules, require them
function findRules(cb) {
  var rulesDir = path.join(__dirname, 'rules');

  fs.readdir(rulesDir, function(err, files) {
    files = _(files).filter(function(file) {
      // ignore non JS files
      return /\.js$/.test(file);
    }).map(function(file) {
      return {
        name: file.replace(/\.js$/, ''),
        module: require(path.join(rulesDir, file))
      };
    }).value();

    cb(err, files);
  });
}

function best(config) {
  // TODO: allow extra rules to be passed in

  findRules(function(err, rules) {
    if (err) console.log(err);

    // run the rule
    async.eachSeries(rules, function(rule, cb) {

      // ignore rules which are not needed based on config
      rule.config = config.rules[rule.name];
      if (_.isArray(rule.config) && rule.config[0] === 0) {
        debug('rule: skipping' + rule.name);
        return cb();
      }

      debug('rule: ' + rule.name);
      var module = rule.module;
      rule.module(config, function(err, results) {
        if (err) return cb(err);
        var msg = results.success ? 'succeded' : 'failed';
        debug('rule:' + rule.name + ' ' + msg);
        cb();
      });

      // TODO: capture some sort of response from the rules

    }, function(err) {
      if (err) console.log(err);
      if (!/node-dev$/.test(process.env._)) {
        process.exit(0);
      } else {
        setInterval(function() {}, 1e3);
      }
    });
  });
}

module.exports = best;

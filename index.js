
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
    }).filter(function(file) {
      // TODO: ignore rules which are not needed based on config
      return true;
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

  findRules(function(err, rules) {
    if (err) console.log(err);

    // run the rule
    async.eachSeries(rules, function(rule, cb) {

      debug('rule:' + rule.name);
      var module = rule.module;
      rule.module(config, cb);

      // TODO: capture some sort of response from the rules

    }, function() {
      if (!/node-dev$/.test(process.env._)) {
        process.exit(0);
      } else {
        setInterval(function() {}, 1e3);
      }
    });
  });
}

module.exports = best;

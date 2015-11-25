
var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('lodash');

// find the rules
function findRules(_cb) {
  var rulesDir = path.join(__dirname, 'rules');

  // find the rules, filter unimportant rules, require them
  async.waterfall([
    function(cb) {
      fs.readdir(rulesDir, cb);
    }, function(files, cb) {

      files = _(files).filter(function(file) {
        // ignore non JS files
        return /\.js$/.test(file);
      }).filter(function(file) {
        // TODO: ignore rules which are not needed based on config
        return true;
      }).map(function(file) {
        return path.join(rulesDir, file);
      }).value();

      console.log(files);

      cb(null, files);

    }, function(rules, cb) {
      var modules = rules.map(function(rule) {
        return require(rule);
      });
      cb(null, modules);
    }
  ], _cb);

}

function best(config) {

  findRules(function(err, rules) {
    if (err) console.log(err);

    async.eachSeries(rules, function(rule, cb) {
      console.log('running rule', rule);

      // init rule
      // var module = rule[rule.length - 1];
      var module = rule;

      // TODO: the dep injection thing...
      // TODO: do a .apply
      module({}, cb);

      // TODO: make the rules async
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

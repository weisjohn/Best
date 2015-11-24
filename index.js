
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

      var files = _.map(files, function(file) {
        return path.join(rulesDir, file);
      });

      // TODO: ignore rules which are not needed based on config

      async.map(files, function(file, cb) {
        fs.stat(file, function(err, stats) {
          if (!stats.isDirectory()) return cb();
          cb(err, file);
        });
      }, function(err, files) {
        cb(err, _.without(files, undefined));
      });

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
      // console.log('running rule', rule);

      // init rule
      var module = rule[rule.length - 1];

      // TODO: the dep injection thing...
      // TODO: do a .apply
      module();

      // TODO: make the rules async
      cb();
    });
  });
}

module.exports = best;

setInterval(function() {}, 1e3);

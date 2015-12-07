
// detect if there are more than 10 resources

var debug = require('debug')('best:resources');
var utils = require('./utils');

// we need CSS and JS files
var tags = [{
  selector: 'link[rel=stylesheet]',
  attr: 'href',
}, {
  selector: 'script',
  attr: 'src',
}];

var max = 10;

module.exports = function resources(config, cb) {

  config.tags = tags;
  utils.resources(config, function(err, results) {
    if (err) return cb(err);

    var len = results.resources.length;
    var ret = { pass: len <= max };
    if (!ret.pass) ret.errors = results.resources;

    cb(null, ret);

  });
};

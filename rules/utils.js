
// common utils used by multiple modules

var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var sigmund = require('sigmund');

var debug = require('debug')('best:util');

// a simple memoized wrapper around request
var utils = {
  get: async.memoize(function(opts, cb) {
    debug('fetching: ' + opts.url);
    return request.get(opts, cb);
  }, function(opts) {
    return sigmund(opts.url);
  }),
};

// return an array of values from a tag map (an array of objects with selector,property pairs)
function _resources(config, cb) {
  if (!config.tags) throw new Error('A tag map must be specified');
  utils.get(config, function(err, res) {
    if (err) return cb(err);

    // parse the HTML for resources
    var $ = cheerio.load(res.body);
    var results = { all: [], resources: [], locals: [] };

    // ignore different domains & protocol relative resources
    var remote = /^(http\:|https\:)?\/\//;

    // find elements which match the tags specified by caller
    debug(config.tags);
    config.tags.forEach(function(tag) {
      $(tag.selector).each(function() {
        var attr = $(this).attr(tag.attr);
        results.all.push(attr);
        if (attr) results.resources.push(attr);
        if (!remote.test(attr)) results.locals.push(attr);
      });
    });

    debug('totals ' + results.resources.length);
    debug('assets ' + results.locals.length);

    cb(null, results);

  });
}

// memoize with a custom hash - https://github.com/caolan/async#memoize
utils.resources = async.memoize(_resources, function(config) {
  return sigmund({ url: config.url, tags: config.tags });
});

module.exports = utils;

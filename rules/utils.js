
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
    var resources = [];

    // find elements which match the tags specified by caller
    debug(config.tags);
    config.tags.forEach(function(tag) {
      $(tag.selector).each(function() {
        resources.push($(this).attr(tag.attr));
      });
    });

    // ignore different domains & protocol relative resources
    var locals = resources.filter(function(resource) {
      if (!/^(http\:|https\:)?\/\//.test(resource)) return true;
      debug('remote', resource);
    });

    debug('totals ' + resources.length);
    debug('assets ' + locals.length);

    cb(null, { resources: resources, locals: locals });

  });
}

// memoize with a custom hash - https://github.com/caolan/async#memoize
utils.resources = async.memoize(_resources, function(config) {
  return sigmund({ url: config.url, tags: config.tags });
});

module.exports = utils;

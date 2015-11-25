
// evaluate if there is a cache breaking system

var request = require('request');
var cheerio = require('cheerio');
var debug = require('debug')('best:cache');

// cache breaking detection regexes
var hashed = /[0-9a-f]{4}/;
var versioned = /\?(v)\=/;

module.exports = function cache(config, cb) {
  request.get(config.url, function(err, res) {
    if (err) return cb(err);

    // parse the HTML for resources
    var $ = cheerio.load(res.body);
    var resources = [];

    $('link[rel=stylesheet]').each(function() {
      var href = $(this).attr('href');
      if (href) resources.push(href);
    });

    $('script').each(function() {
      var src = $(this).attr('src');
      if (src) resources.push(src);
    });

    // ignore different domains & protocol relative resources
    var locals = resources.filter(function(resource) {
      if (!/^(http\:|https\:)?\/\//.test(resource)) return true;
      debug('ignore', resource);
    });

    // detect whether or not it uses a cache breaker
    var cached = locals.filter(function(resource) {

      if (hashed.test(resource)) {
        debug('hashed', resource);
      } else if (versioned.test(resource)) {
        debug('versioned', resource);
      } else {
        debug('missed', resource);
        return;
      }
      return resource;

    });

    debug('local assets: ', locals.length);
    debug('using cache-breakers: ' + cached.length);

    // determine score
    var success = (locals.length / 2) < cached.length;
    var errors = locals.length - cached.length;

    cb(null, { success: success, errors: errors });
  });
};

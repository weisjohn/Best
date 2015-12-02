
// evaluate if there is a cache breaking system

var debug = require('debug')('best:cache');
var utils = require('./utils');
var _ = require('lodash');

// cache breaking detection regexes
var hashed = /[0-9a-f]{4}/;
var versioned = /\?(v)\=/;

// we need CSS and JS files
var tags = [{
  selector: 'link[rel=stylesheet]',
  attr: 'href',
}, {
  selector: 'script',
  attr: 'src',
}];

module.exports = function cache(config, cb) {

  config.tags = tags;
  utils.resources(config, function(err, results) {
    if (err || !results) return cb(err);

    var locals = results.locals;

    // detect whether or not it uses a cache breaker
    var cached = locals.filter(function(resource) {
      if (hashed.test(resource)) {
        debug('hashed', resource);
      } else if (versioned.test(resource)) {
        debug('versioned', resource);
      } else {
        debug('missed', resource);
        return false;
      }

      return resource;
    });

    debug('assets ' + locals.length);
    debug('caches ' + cached.length);

    // determine score
    var response = {
      pass: (locals.length / 2) < cached.length,
      errors: _.difference(locals, cached),
    };

    cb(null, response);
  });
};

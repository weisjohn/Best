
// common utils used by multiple modules

var request = require('request');
var cheerio = require('cheerio');
var debug = require('debug')('best:util');

function resources(config, cb) {
  if (!config.tags) throw new Error('A tag map must be specified');

  request.get(config.url, function(err, res) {
    if (err) return cb(err);

    // parse the HTML for resources
    var $ = cheerio.load(res.body);
    var _resources = [];

    // find elements which match the tags specified by caller
    config.tags.forEach(function(tag) {
      $(tag.selector).each(function() {
        var attr = $(this).attr(tag.attr);
        if (attr) _resources.push(attr);
      });
    });

    // ignore different domains & protocol relative _resources
    var locals = _resources.filter(function(resource) {
      if (!/^(http\:|https\:)?\/\//.test(resource)) return true;
      debug('ignore', resource);
    });

    debug('totals ' + _resources.length);
    debug('assets ' + locals.length);

    cb(null, { resources: _resources, locals: locals });

  });
}

module.exports = { resources: resources };

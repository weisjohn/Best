
var request = require('request');
var cheerio = require('cheerio');
var async = require('async');
var url = require('url');
var debug = require('debug')('best:favicon');

module.exports = function favicon(config, cb) {
  request.get(config.url, function(err, res) {
    if (err) return cb(err);

    // parse the HTML for resources
    var $ = cheerio.load(res.body);
    var resources = [];

    $('link[rel="shortcut icon"]').each(function() {
      var href = $(this).attr('href');
      if (href) resources.push(href);
    });

    // if the site does not specify a favicon, add a default url
    if (resources.length === 0) resources.push('/favicon.ico');

    // look for a favicon
    async.detect(resources, function(resource, _cb) {
      var _url = url.resolve(config.url, resource);
      debug('fetch ' + resource);

      // attempt to fetch the favicon
      request.get(_url, function(_err, _res) {
        if (_err) return cb();

        var status = _res.statusCode === 200;
        var image = _res.headers['content-type'] === 'image/x-icon';
        var content = _res.headers['content-length'] !== '0';

        if (status && image || status && content) return _cb(resource);
        return _cb();
      });

    }, function(result) {
      cb(null, { pass: !!result });
    });

  });
};

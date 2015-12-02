
// detect if there is at least one favicon

var request = require('request');
var async = require('async');
var url = require('url');

var debug = require('debug')('best:favicon');
var utils = require('./utils');

// we need favicon links
var tags = [{
  selector: 'link[rel="shortcut icon"]',
  attr: 'href',
}];

module.exports = function favicon(config, cb) {

  config.tags = tags;
  utils.resources(config, function(err, results) {
    if (err) return cb(err);

    // if the site does not specify a favicon, use the default url
    var resources = results.resources.length || ['/favicon.ico'];

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

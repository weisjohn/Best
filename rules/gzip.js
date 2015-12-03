
// detect if resources are sent using gzip

var async = require('async');
var url = require('url');
var _ = require('lodash');

var debug = require('debug')('best:gzip');
var utils = require('./utils');

// we need CSS and JS files
var tags = [{
  selector: 'link[rel=stylesheet]',
  attr: 'href',
}, {
  selector: 'script',
  attr: 'src',
}];

module.exports = function gzip(config, cb) {

  config.tags = tags;
  utils.resources(config, function(err, res) {
    if (err || !res || !res.resources) return cb(err);

    // fetch each resource
    async.map(res.resources, function(resource, _cb) {

      var _url = url.resolve(config.url, resource);

      // fetch the resource
      utils.get({ url: _url, gzip: true }, function(_err, _res) {
        if (_err) return cb(_err);

        var encoding = _res.headers['content-encoding'];

        if (/gzip/.test(encoding)) return _cb(null, resource);

        return _cb();
      });

    }, function(err, result) {
      if (err) return cb(err);

      // remove empty items
      result = _.without(result, undefined);

      // all resources must be sent with gzip
      var pass = result.length === res.resources.length;
      var errors = _.difference(res.resources, result);

      cb(null, { pass: pass, errors: errors });
    });

  });
};

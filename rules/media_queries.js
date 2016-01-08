
var async = require('async');
var url = require('url');
var css = require('css-parse');
var _ = require('lodash');

// TODO: bring the debug back
// var debug = require('debug')('best:media_queries');
var utils = require('./utils');

// minimium number of non-print MQs necessary
var min = 60;

// we need CSS files
var tags = [{
  selector: 'link[rel=stylesheet]',
  attr: 'href',
}];

function findResponsiveMediaQueries(body) {
  var parsed = css(body, { silent: true });
  var rules = parsed.stylesheet.rules;

  // looks for media queries that aren't print
  return _.chain(rules)
    .where({ type: 'media' })
    .reject({ media: 'print' })
    .value().length;
}

module.exports = function mediaQueries(config, cb) {

  // fetch these tags from the resources
  config.tags = tags;

  // gather both inline CSS and remote files

  // TODO: fetch any style tags from the document

  utils.resources(config, function(err, results) {
    // TODO: detect if a boilerplate is included separately in the resources

    if (!results.resources || !results.resources.length) {
      return cb(null, { pass: false, errors: 'no CSS found' });
    }

    // fetch all CSS files
    async.map(results.resources, function(resource, _cb) {
      var _url = url.resolve(config.url, resource);
      utils.get({ url: _url }, function(error, response) {
        if (error) return _cb(error);
        _cb(null, { file: resource, body: response.body });
      });
    }, function(error, _results) {

      var queries = _results.map(function(res) {
        return findResponsiveMediaQueries(res.body);
      }).reduce(function(p, c) {
        return p + c;
      }, 0);

      var ret = {};
      ret.pass = queries >= min;
      if (!ret.pass) ret.errors = results.resources;

      return cb(null, ret);
    });

  });

};

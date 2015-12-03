
// ensure meta tags are set properly

var request = require('request');
var cheerio = require('cheerio');

var debug = require('debug')('best:meta');
var utils = require('./utils');
var _ = require('lodash');

var required = [
  'description',
  'keywords',
  'og:title',
  'og:image'
];

module.exports = function meta(config, cb) {

  request.get(config.url, function(err, res) {
    if (err) return cb(err);

    // parse the HTML for resources
    var $ = cheerio.load(res.body);
    var resources = {};

    $('meta').each(function() {
      var name = $(this).attr('name');
      var content = $(this).attr('content');

      // only add if the tag has a name and content is not empty
      if (name && content) resources[name] = content;
    });

    var errors = _.difference(required, _.keys(resources));

    var ret = { pass: !errors.length };
    if (errors) ret.errors = errors;

    cb(null, ret);
  });

};


// detect if image tags use alt attributes

var debug = require('debug')('best:alt');
var utils = require('./utils');
var cheerio = require('cheerio');
var _ = require('lodash');

module.exports = function resources(config, cb) {

  utils.get(config, function(err, res) {
    if (err) return cb(err);

    // parse the HTML for resources
    var $ = cheerio.load(res.body);
    var images = [];

    // scrape all the images
    $('img').each(function(i, elem) {
      var $elem = $(elem);
      images.push({
        src: $elem.attr('src'),
        alt: $elem.attr('alt'),
      });
    });

    // detect missing alt attributes
    var missing = _.chain(images).filter(function(image) {
      return !image.alt;
    }).map('src').value();

    debug('missing: ' + missing.length);

    var ret = { pass: !missing.length };
    if (!ret.pass) ret.errors = missing;

    cb(null, ret);

  });
};

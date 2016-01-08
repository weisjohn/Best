
// detect if scripts are blocking rendering or DOM construction
// this rule ignores inline script - https://twitter.com/paul_irish/status/97502446674391041

var debug = require('debug')('best:script');
var utils = require('./utils');

var cheerio = require('cheerio');

module.exports = function script(config, cb) {

  utils.get(config, function(err, res) {
    if (err) return cb(err);

    // parse the HTML for resources
    var $ = cheerio.load(res.body);
    var errors = [];
    var externals = [];

    // TODO: all script tags should be in the <head>

    $('script[src]').each(function(i, elem) {
      var $elem = $(elem);
      var src = $elem.attr('src');
      externals.push(src);

      // check if the script is either async or defer
      if ($elem.attr('async') || $elem.attr('defer')) {
        debug('async/defer found', src);
      } else {
        debug(src);
        errors.push(src);
      }
    });

    var score = (externals.length - errors.length) / externals.length;
    var ret = { pass: score >= 0.75 };
    if (!ret.pass) ret.errors = errors;

    cb(null, ret);
  });

};

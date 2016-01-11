
// detect if page specifies a language

var debug = require('debug')('best:lang');
var utils = require('./utils');
var cheerio = require('cheerio');

module.exports = function resources(config, cb) {

  utils.get(config, function(err, res) {
    if (err) return cb(err);

    // parse the HTML for resources
    var $ = cheerio.load(res.body);

    var found = $('html').first().attr('lang');
    if (!found) found = $('meta[http-equiv="Content-Language"]').attr('content');

    if (found) debug('detected: ' + found);

    var ret = { pass: !!found };
    cb(null, ret);

  });
};

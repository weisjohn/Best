
// ensure site has a valid HTTPS connection

var request = require('request');

var debug = require('debug')('best:https');
var utils = require('./utils');

var mismatch = /Hostname\/IP\ doesn\'t match certificate/;

module.exports = function https(config, cb) {

  // if url doesn't have https, attempt upgrade
  if (!/https:\/\//.test(config.url)) {
    debug('non https url specified: ' + config.url);
    config.url = config.url.replace('http://', 'https://');
  }

  debug('fetch: ' + config.url);
  request.get(config.url, function(err, res) {

    // verify the error matches a known error message
    if (err && mismatch.test(err.message)) {
      debug('error: ' + err.reason);
    } else if (err) {
      return cb(err);
    }

    var ret = { pass: !err };
    if (err) ret.errors = [err];

    cb(null, ret);
  });

};

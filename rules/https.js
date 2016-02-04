
// ensure site has a valid HTTPS connection

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
  utils.get(config, function(err, res) {

    // verify the error matches a known error message
    if (err && mismatch.test(err.message)) {
      debug('error: ' + err.reason);
    } else if (err.code === 'ECONNREFUSED') {
      err = 'cannot connect via HTTPS';
    } else if (err) {
      return cb(err);
    } else if (res.statusCode !== 200) {

      // if the site doesn't send a 200, there's a problem
      err = 'Invalid HTTP Status Code: ' + res.statusCode;
    }

    var ret = { pass: !err };
    if (err) {
      if (err.cert && err.cert.raw) {
        delete err.cert.raw;
      }
      ret.errors = [err];
    }

    cb(null, ret);
  });

};

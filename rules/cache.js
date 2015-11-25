
module.exports = function cache(config, cb) {
  console.log('cache', config);
  setTimeout(function() {
    cb();
  }, 1e3);
};

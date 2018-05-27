'use strict';

var postcss = require('postcss');

exports.default = function (content, config, filePath) {
  return new Promise(function (resolve, reject) {
    postcss(config.plugins).process(content, {
      from: undefined
    }).then(function (res) {
      resolve(res.css);
    }).catch(reject);
  });
};
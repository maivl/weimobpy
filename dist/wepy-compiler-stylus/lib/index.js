'use strict';

exports.__esModule = true;

exports.default = function (content, config, file) {
    return new Promise(function (resolve, reject) {
        var opath = _path2.default.parse(file);
        config.paths = [opath.dir];
        config.filename = opath.base;

        _stylus2.default.render(content, config, function (err, css) {
            if (err) reject(err);else {
                resolve(css);
            }
        });
    });
};

var _stylus = require('stylus');

var _stylus2 = _interopRequireDefault(_stylus);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;
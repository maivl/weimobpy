'use strict';

exports.__esModule = true;

exports.default = function (content, config, file) {
    return new Promise(function (resolve, reject) {
        var opath = _path2.default.parse(file);
        config.paths = [opath.dir];

        _less2.default.render(content, config).then(function (res) {
            resolve(res.css);
        }).catch(reject);
    });
};

var _less = require('less');

var _less2 = _interopRequireDefault(_less);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

;
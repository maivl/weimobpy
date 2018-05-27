'use strict';

exports.__esModule = true;

var _pug = require('pug');

var _pug2 = _interopRequireDefault(_pug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var compiler = function compiler(content, config) {
    var data = config.data;
    var p = void 0;
    delete config.data;
    try {
        var fn = _pug2.default.compile(content, config);
        var html = fn(data);
        p = Promise.resolve(html);
    } catch (e) {
        p = Promise.reject(e);
    }
    return p;
};

compiler.sync = function (content, config) {
    var data = config.data;
    var p = void 0,
        html = void 0;
    delete config.data;
    var fn = _pug2.default.compile(content, config);
    html = fn(data);
    return html;
};

exports.default = compiler;
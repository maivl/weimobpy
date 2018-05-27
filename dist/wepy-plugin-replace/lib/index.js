'use strict';

exports.__esModule = true;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _class = function () {
    function _class() {
        var c = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, _class);

        var def = {
            filter: /\w$/,
            config: {}
        };

        if (Array.isArray(c)) {
            this.setting = c.map(function (s) {
                return Object.assign({}, def, s);
            });
            return;
        }

        this.setting = Object.assign({}, def, c);
    }

    _class.prototype.apply = function apply(op) {

        var setting = this.setting;

        var settings = [];

        if (setting instanceof Array) {
            settings = settings.concat(setting);
        } else if (setting instanceof Object && !setting.filter) {
            for (var key in setting) {
                var value = setting[key];
                if (value.filter) {
                    settings.push(value);
                }
            }
        } else if (setting instanceof Object && setting.filter) {
            settings.push(setting);
        }

        settings.forEach(function (setting) {
            if (op.code !== null && setting.filter.test(op.file)) {
                op.output && op.output({
                    action: '变更',
                    file: op.file
                });

                var config = setting.config;
                var configs = [];

                if (config instanceof Array) {
                    configs = configs.concat(config);
                } else if (config instanceof Object && !config.find) {
                    for (var _key in config) {
                        var _value = config[_key];
                        if (_value.find) {
                            configs.push(_value);
                        }
                    }
                } else if (config instanceof Object && config.find) {
                    configs.push(config);
                }

                configs.forEach(function (config) {
                    op.code = op.code.replace(config.find, config.replace);
                });
            }
        });

        op.next();
    };

    return _class;
}();

exports.default = _class;
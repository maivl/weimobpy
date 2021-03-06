'use strict';

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ModuleMap = function () {
    function ModuleMap() {
        (0, _classCallCheck3.default)(this, ModuleMap);

        this._index = -1;
        this._map = {};
        this._objectMap = {};
        this._objectPending = {};
    }

    ModuleMap.prototype.add = function add(file, wpy) {
        var index = this.get(file);
        if (index === undefined) {
            this._index++;
            this.length = this._index + 1;
            index = this._index;
            this._map[file] = index;
        }
        if (wpy) this._objectMap[index] = wpy;
        return index;
    };

    ModuleMap.prototype.get = function get(file) {
        return this._map[file];
    };

    ModuleMap.prototype.getObject = function getObject(file) {
        var index = file;
        if (typeof file === 'string') {
            index = this.get(file);
        }
        return this._objectMap[index];
    };

    ModuleMap.prototype.getArray = function getArray() {
        this._objectMap.length = this.length;
        return Array.prototype.slice.apply(this._objectMap);
    };

    ModuleMap.prototype.setPending = function setPending(src) {
        this._objectPending[src] = true;
    };

    ModuleMap.prototype.getPending = function getPending(src) {
        return this._objectPending[src];
    };

    return ModuleMap;
}();

var instance = void 0;

exports = module.exports = {
    getInstance: function getInstance() {
        if (!instance) throw 'Create instance before call getInstance';
        return instance;
    },
    createInstance: function createInstance() {
        instance = new ModuleMap();
        return instance;
    }
};
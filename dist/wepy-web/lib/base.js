'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _vue = require('vue');

var _vue2 = _interopRequireDefault(_vue);

var _vueRouter = require('vue-router');

var _vueRouter2 = _interopRequireDefault(_vueRouter);

var _event = require('./event');

var _event2 = _interopRequireDefault(_event);

var _word = require('./helper/word');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pageEvent = ['onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage'];

var addStyle = function addStyle(stylelist) {
    var styleElement = document.createElement('style');
    var head = document.head || document.getElementsByTagName('head')[0];

    var css = '';
    stylelist.forEach(function (id) {
        css += __wepy_require(id) + '\r\n';
    });

    var cssNode = document.createTextNode(css);
    styleElement.appendChild(cssNode);
    head.appendChild(styleElement);
    styleElement.type = 'text/css';
    return styleElement;
};

var $createMixin = function $createMixin(com, mixinClass) {
    var obj = {};
    var mixin = new mixinClass();
    for (var k in mixin) {
        if (k === 'data') {
            obj.data = function () {
                return mixin.data;
            };
        } else if (k === 'methods') {
            obj[k] = {};
            for (var method in mixin[k]) {
                obj[k][method] = mixin[k][method].bind(com);
            }
        } else {
            obj[k] = mixin[k];
        }
    }
    return obj;
};

var $createComponent = function $createComponent(com, template) {

    var k = void 0,
        vueObject = {};

    vueObject.template = template;
    vueObject.data = function () {
        return com.data;
    };

    vueObject.components = {};
    vueObject.methods = {};

    Object.getOwnPropertyNames(com.components || {}).forEach(function (name) {
        var cClass = com.components[name];
        var child = new cClass();

        child.$name = name;

        com.$com[name] = child;
        vueObject.components[name] = $createComponent(child, cClass.template);
    });

    Object.getOwnPropertyNames(com.methods || {}).forEach(function (method) {
        var fn = com.methods[method];
        vueObject.methods[method] = function () {
            for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
                arg[_key] = arguments[_key];
            }

            var e = arg[arg.length - 1];

            if (!e) {
                e = this.$arguments[0];
            }
            var evt = new _event2.default('system', com, e.type);
            evt.$transfor(e);
            if (evt.type === 'input') {
                evt.detail = {};
                evt.detail.value = evt.srcElement.value;
            }
            arg[arg.length - 1] = evt;

            if (com.$vm !== this) {
                com.$vm = this;
                com.$index = this.$parent.$children.indexOf(this);
                if (this.$parent && this.$parent.$parent && this.$parent.$parent.$children) {
                    com.$parent.$index = this.$parent.$parent.$children.indexOf(this.$parent);
                }
            }
            fn.apply(com, arg);
        };
    });

    if (_typeof(com.mixins) === 'object' && com.mixins.constructor === Array) {
        vueObject.mixins = com.mixins.map(function (mixin) {
            return $createMixin(com, mixin);
        });
    } else if (typeof com.mixins === 'function') {
        vueObject.mixins = [$createMixin(com, mixin)];
    }

    vueObject.props = com.props;
    vueObject.computed = com.computed;
    vueObject.watch = com.watch;
    vueObject.events = com.events;

    vueObject.created = function () {
        com.$wxpage = this;
        com.$vm = this;
        this.$wepy = com;

        if (!com.$isComponent) {
            wx._currentPage = com;
            wx._currentPage.__route__ = this.$route.path;
            wx._currentPage.__wxWebviewId__ = 0;

            var share = typeof com.onShareAppMessage === 'funciton' ? com.onShareAppMessage() : null;
            if (share) {
                wx.__initShare && wx.__initShare(share);
            } else {
                wx.__hideShare && wx.__hideShare();
            }
        }

        if (typeof com.onLoad === 'function') {
            com.onLoad.call(com, com.$vm.$route.query, {});
        }
    };

    vueObject.ready = function () {
        console.log(com.$name + ' is ready');
        com.$wxpage = this;
        com.$vm = this;

        if (typeof com.onShow === 'function') {
            com.onShow.call(com);
        }
    };

    [].concat(Object.getOwnPropertyNames(com.props || {})).concat(Object.getOwnPropertyNames(com.computed || {})).concat(Object.getOwnPropertyNames(com.data || {})).forEach(function (v) {
        v = (0, _word.camelize)(v);
        Object.defineProperty(com, v, {
            get: function get() {
                return com.$vm[v];
            },
            set: function set(val) {
                com.$vm[v] = val;
            }
        });
    });
    return vueObject;
};

exports.default = {
    $createApp: function $createApp(appClass, config) {
        var k = void 0,
            routes = [];

        var app = new appClass();

        this.platform = wx.__platform;
        app.$components = [];
        app.$apis = [];

        if (!this.$instance) {
            app.$init(this);
            this.$instance = app;
        }

        addStyle(config.style);

        if (typeof app.onLaunch === 'function') {
            app.onLaunch();
        }
        if (typeof app.onShow === 'function') {
            console.warn('onShow is not implemented in web');
        }
        if (typeof app.onHide === 'function') {
            console.warn('onHide is not implemented in web');
        }

        for (k in config.components) {
            app.$components.push(k);
            var com = __wepy_require(config.components[k]).default;
            com.name = 'wepy-' + com.name;
            _vue2.default.component('wepy-' + k, com);
        }

        var _loop = function _loop() {
            app.$apis.push(k);
            var apiMod = __wepy_require(config.apis[k]);
            if (apiMod.default) {
                Object.defineProperty(wx, k, {
                    get: function get() {
                        return apiMod.getter(_vue2.default.extend(apiMod.default));
                    }
                });
            } else {
                Object.defineProperty(wx, k, {
                    get: function get() {
                        return apiMod.getter();
                    }
                });
            }
        };

        for (k in config.apis) {
            _loop();
        }

        _vue2.default.use(_vueRouter2.default);

        var router = new _vueRouter2.default();
        var index = '';

        for (k in config.routes) {
            var tmp = {};
            if (!index) index = k;
            tmp['/' + k] = {
                component: this.$createPage(__wepy_require(config.routes[k]).default, '/' + k)
            };
            router.map(tmp);
        }
        router.redirect({
            '*': '/' + index
        });
        router.start({}, '#app');

        router.beforeEach(function (trans) {
            window.scrollTo(0, 0);
            trans.next();
        });

        window.$router = router;
    },
    $createPage: function $createPage(pageClass, pagePath) {

        var page = new pageClass();

        if (pagePath) this.$instance.$pages[pagePath] = page;

        page.$name = pageClass.name || 'unnamed';
        page.$app = this.$instance;

        var vueObject = $createComponent(page, pageClass.template);

        page.$init(_vue2.default, this.$instance, this.$instance);

        wx._currentPages = wx._currentPages || [];
        wx._currentPages.push(page);
        page.__route__ = pagePath;
        page.__wxWebviewId__ = 0;

        return vueObject;
    }
};
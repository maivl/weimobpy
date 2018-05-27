'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _xmldom = require('xmldom');

var _eslint = require('./eslint');

var _eslint2 = _interopRequireDefault(_eslint);

var _cache = require('./cache');

var _cache2 = _interopRequireDefault(_cache);

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

var _compileConfig = require('./compile-config');

var _compileConfig2 = _interopRequireDefault(_compileConfig);

var _compileStyle = require('./compile-style');

var _compileStyle2 = _interopRequireDefault(_compileStyle);

var _compileTemplate = require('./compile-template');

var _compileTemplate2 = _interopRequireDefault(_compileTemplate);

var _compileScript = require('./compile-script');

var _compileScript2 = _interopRequireDefault(_compileScript);

var _index = require('./web/index');

var _index2 = _interopRequireDefault(_index);

var _loader = require('./loader');

var _loader2 = _interopRequireDefault(_loader);

var _resolve = require('./resolve');

var _resolve2 = _interopRequireDefault(_resolve);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var globalLocator = {};

exports.default = {
    _cacheWpys: {},
    createParser: function createParser(opath) {
        return new _xmldom.DOMParser({
            locator: globalLocator,
            errorHandler: {
                warning: function warning(x) {
                    if (x.indexOf('missed value!!') > -1) {} else {
                        if (!opath) {
                            _util2.default.warning(x);
                        } else {
                            _util2.default.warning('WARNING IN : ' + _path2.default.relative(_util2.default.currentDir, _path2.default.join(opath.dir, opath.base)) + '\n' + x);
                        }
                    }
                },
                error: function error(x) {
                    if (!opath) {
                        _util2.default.error(x);
                    } else {
                        _util2.default.error('ERROR IN : ' + _path2.default.relative(_util2.default.currentDir, _path2.default.join(opath.dir, opath.base)) + '\n' + x);
                    }
                }
            }
        });
    },
    grabConfigFromScript: function grabConfigFromScript(str, n) {
        var stash = [],
            rst = '';
        for (var i = n, l = str.length; i < l; i++) {
            if (str[i] === '{') stash.push('{');
            if (str[i] === '}') {
                stash.pop();
                if (stash.length === 0) {
                    rst += '}';
                    break;
                }
            }
            if (stash.length) {
                rst += str[i];
            }
        }
        return rst;
    },
    resolveRelation: function resolveRelation(xml) {
        var requires = [];
        var matchs = xml.match(/<component[^/>]*\/>/ig);

        (matchs || []).forEach(function (m) {
            var rst = void 0;
            if (m.indexOf('path') > -1) {
                rst = m.match(/path\s*=\s*['"](.*)['"]/);
            } else {
                rst = m.match(/id\s*=\s*['"](.*)['"]/);
            }
            if (rst[1] && requires.indexOf(rst[1]) === -1) requires.push(rst[1]);
        });
        return requires;
    },
    resolveWpy: function resolveWpy(xml, opath) {
        var _this = this;

        return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
            var config, filepath, content, moduleId, rst, startlen, compiler, node;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            config = _util2.default.getConfig();
                            filepath = void 0;


                            if ((typeof xml === 'undefined' ? 'undefined' : _typeof(xml)) === 'object' && xml.dir) {
                                opath = xml;
                                filepath = _path2.default.join(xml.dir, xml.base);
                            } else {
                                opath = _path2.default.parse(xml);
                                filepath = xml;
                            }
                            filepath = _path2.default.resolve(filepath);content = _util2.default.readFile(filepath);
                            moduleId = _util2.default.genId(filepath);
                            rst = {
                                moduleId: moduleId,
                                style: [],
                                template: {
                                    code: '',
                                    src: '',
                                    type: ''
                                },
                                script: {
                                    code: '',
                                    src: '',
                                    type: ''
                                }
                            };

                            if (!(content === null)) {
                                _context.next = 10;
                                break;
                            }

                            _util2.default.error('打开文件失败: ' + filepath);
                            return _context.abrupt('return', rst);

                        case 10:
                            if (!(content === '')) {
                                _context.next = 13;
                                break;
                            }

                            _util2.default.warning('发现空文件: ' + filepath);
                            return _context.abrupt('return', rst);

                        case 13:
                            startlen = content.indexOf('<script') + 7;

                            if (startlen >= 7 && content.length >= 8) {
                                while (content[startlen++] !== '>') {}
                                content = _util2.default.encode(content, startlen, content.indexOf('</script>') - 1);
                            }


                            if (content.indexOf('<template') !== -1) {
                                content = _util2.default.attrReplace(content);
                            }

                            xml = _this.createParser(opath).parseFromString(content);

                            [].slice.call(xml.childNodes || []).forEach(function (child) {
                                var nodeName = child.nodeName;
                                if (nodeName === 'style' || nodeName === 'template' || nodeName === 'script') {
                                    var rstTypeObj = void 0;

                                    if (nodeName === 'style') {
                                        rstTypeObj = { code: '' };
                                        rst[nodeName].push(rstTypeObj);
                                    } else {
                                        rstTypeObj = rst[nodeName];
                                    }

                                    rstTypeObj.src = child.getAttribute('src');
                                    rstTypeObj.type = child.getAttribute('lang') || child.getAttribute('type');
                                    if (nodeName === 'style') {
                                        rstTypeObj.scoped = child.getAttribute('scoped') ? true : false;
                                    }

                                    if (rstTypeObj.src) {
                                        rstTypeObj.src = _path2.default.resolve(opath.dir, _resolve2.default.resolveAlias(rstTypeObj.src, opath));
                                        rstTypeObj.link = true;
                                    } else {
                                        rstTypeObj.link = false;
                                    }

                                    if (rstTypeObj.src && _util2.default.isFile(rstTypeObj.src)) {
                                        var fileCode = _util2.default.readFile(rstTypeObj.src, 'utf-8');
                                        if (fileCode === null) {
                                            throw '打开文件失败: ' + rstTypeObj.src;
                                        } else {
                                            rstTypeObj.code += fileCode;
                                        }
                                    } else {
                                        [].slice.call(child.childNodes || []).forEach(function (c) {
                                            rstTypeObj.code += _util2.default.decode(c.toString());
                                        });
                                    }

                                    if (!rstTypeObj.src) rstTypeObj.src = _path2.default.join(opath.dir, opath.name + opath.ext);
                                }
                            });

                            rst.template.type = rst.template.type || 'wxml';
                            rst.script.type = rst.script.type || 'babel';

                            compiler = _loader2.default.loadCompiler(rst.script.type);

                            if (!compiler) {
                                _context.next = 24;
                                break;
                            }

                            _context.next = 24;
                            return compiler(rst.script.code, config.compilers[rst.script.type] || {}).then(function (compileResult) {
                                var sourceMap = void 0;
                                var code = void 0;
                                if (typeof compileResult === 'string') {
                                    code = compileResult;
                                } else {
                                    sourceMap = compileResult.map;
                                    code = compileResult.code;
                                }
                                rst.scropt.code = code;
                            });

                        case 24:
                            (function () {
                                var match = rst.script.code.match(/this\.config\s*=[\s\r\n]*/);
                                match = match ? match[0] : undefined;

                                rst.config = match ? _this.grabConfigFromScript(rst.script.code, rst.script.code.indexOf(match) + match.length) : false;
                                try {
                                    if (rst.config) {
                                        rst.config = new Function('return ' + rst.config)();
                                    }
                                } catch (e) {
                                    _util2.default.output('错误', _path2.default.join(opath.dir, opath.base));
                                    _util2.default.error('\u89E3\u6790config\u51FA\u9519\uFF0C\u62A5\u9519\u4FE1\u606F\uFF1A' + e + '\r\n' + rst.config);
                                }
                            })();

                            (function () {
                                if (rst.template.type !== 'wxml' && rst.template.type !== 'xml') {
                                    var _compiler = _loader2.default.loadCompiler(rst.template.type);
                                    if (_compiler && _compiler.sync) {
                                        if (rst.template.type === 'pug') {
                                            var indent = _util2.default.getIndent(rst.template.code);
                                            if (indent.firstLineIndent) {
                                                rst.template.code = _util2.default.fixIndent(rst.template.code, indent.firstLineIndent * -1, indent.char);
                                            }
                                        }
                                        var compilerConfig = config.compilers[rst.template.type];

                                        if (compilerConfig.pretty === undefined) {
                                            compilerConfig.pretty = true;
                                        }
                                        rst.template.code = _compiler.sync(rst.template.code, config.compilers[rst.template.type] || {});
                                        rst.template.type = 'wxml';
                                    }
                                }
                                if (rst.template.code) rst.template.node = _this.createParser(opath).parseFromString(_util2.default.attrReplace(rst.template.code));
                            })();

                            (function () {
                                var coms = {};
                                rst.script.code.replace(/import\s*([\w\-\_]*)\s*from\s*['"]([\w\-\_\.\/\@]*)['"];*/ig, function (match, com, lib, pos) {
                                    coms[com] = {
                                        pos: pos,
                                        lib: lib,
                                        code: match
                                    };
                                });

                                var vars = Object.keys(coms).map(function (com, i) {
                                    return 'var ' + com + ' = {name: "' + com + '", lib: "' + coms[com].lib + '"};';
                                }).join('\r\n');

                                var comMatch = rst.script.code.match(/[\s\r\n]components\s*=[\s\r\n]*/);
                                comMatch = comMatch ? comMatch[0] : undefined;
                                var components = comMatch ? _this.grabConfigFromScript(rst.script.code, rst.script.code.indexOf(comMatch) + comMatch.length) : false;
                                try {
                                    if (components) {
                                        rst.template.components = {};
                                        var comObj = new Function(vars + '\r\nreturn ' + components)();
                                        for (var k in comObj) {
                                            rst.template.components[k] = comObj[k].lib;
                                        }
                                    } else {
                                        rst.template.components = {};
                                    }
                                } catch (e) {
                                    _util2.default.output('错误', _path2.default.join(opath.dir, opath.base));
                                    _util2.default.error('\u89E3\u6790components\u51FA\u9519\uFF0C\u62A5\u9519\u4FE1\u606F\uFF1A' + e + '\r\n' + vars + '\r\nreturn ' + components);
                                }

                                var wxsMatch = rst.script.code.match(/[\s\r\n]wxs\s*=[\s\r\n]*/);
                                wxsMatch = wxsMatch ? wxsMatch[0] : undefined;
                                var wxs = wxsMatch ? _this.grabConfigFromScript(rst.script.code, rst.script.code.indexOf(wxsMatch) + wxsMatch.length) : false;

                                try {
                                    if (wxs) {
                                        rst.template.wxs = new Function(vars + '\r\nreturn ' + wxs)();
                                        rst.script.code = rst.script.code.replace(wxs, '/* ' + wxs + ' */');
                                    } else {
                                        rst.template.wxs = false;
                                    }
                                } catch (e) {
                                    _util2.default.output('错误', _path2.default.join(opath.dir, opath.base));
                                    _util2.default.error('\u89E3\u6790wxs\u51FA\u9519\uFF0C\u62A5\u9519\u4FE1\u606F\uFF1A' + e + '\r\n' + vars + '\r\nreturn ' + wxs);
                                }
                                wxs = rst.template.wxs;

                                if (wxs) {
                                    var wxsCode = '';
                                    for (var _k in wxs) {
                                        rst.script.code = rst.script.code.replace(coms[wxs[_k].name].code, '/* ' + coms[wxs[_k].name].code + ' */');
                                        wxsCode += '<wxs src="' + wxs[_k].lib + '" module="' + _k + '"/>\r\n';
                                    }
                                    rst.script.code = rst.script.code.replace(wxsMatch, '/* ' + wxsMatch + ' */');
                                    rst.template.code = wxsCode + rst.template.code;
                                }
                            })();

                            (function () {
                                if (!rst.template.node) return;
                                var coms = Object.keys(rst.template.components);
                                var elems = [];
                                var props = {};
                                var events = {};
                                var $repeat = {};

                                var repeatItem = '';

                                var calculatedComs = [];

                                _util2.default.elemToArray(rst.template.node.getElementsByTagName('repeat')).forEach(function (repeat) {
                                    elems = [];
                                    if (repeat.getAttribute('for')) {
                                        var tmp = {
                                            for: repeat.getAttribute('for').replace(/^\s*\{\{\s*/, '').replace(/\s*\}\}\s*$/, ''),
                                            item: repeat.getAttribute('item') || 'item',
                                            index: repeat.getAttribute('index') || 'index',
                                            key: repeat.getAttribute('key') || 'key'
                                        };
                                        coms.concat('component').forEach(function (com) {
                                            elems = elems.concat(_util2.default.elemToArray(repeat.getElementsByTagName(com)));
                                        });

                                        elems.forEach(function (elem) {
                                            calculatedComs.push(elem);
                                            var comid = _util2.default.getComId(elem);
                                            var forexp = tmp.for;
                                            if (forexp.indexOf('.') > -1) {
                                                forexp = forexp.split('.')[0];
                                            }
                                            $repeat[forexp] = { com: comid };
                                            [].slice.call(elem.attributes || []).forEach(function (attr) {
                                                if (attr.name !== 'xmlns:v-bind=""') {
                                                    if (attr.name !== 'id' && attr.name !== 'path') {
                                                        if (/v-on:/.test(attr.name)) {
                                                            if (!events[comid]) events[comid] = {};
                                                            events[comid][attr.name] = attr.value;
                                                        } else {
                                                            if (!props[comid]) props[comid] = {};
                                                            if (['hidden', 'wx:if', 'wx:elif', 'wx:else'].indexOf(attr.name) === -1) {
                                                                var assign = { value: attr.value };
                                                                switch (assign.value) {
                                                                    case tmp.item:
                                                                        assign.type = 'item';
                                                                        repeatItem = attr.name.replace('v-bind:', '').replace('.once', '');
                                                                        break;
                                                                    case tmp.index:
                                                                        assign.type = 'index';
                                                                        break;
                                                                    case tmp.key:
                                                                        assign.type = 'key';
                                                                        break;
                                                                }
                                                                props[comid][attr.name] = Object.assign(assign, tmp);
                                                            }
                                                        }
                                                    }
                                                }
                                            });

                                            $repeat[forexp].props = repeatItem;
                                        });
                                    }
                                });

                                elems = [];
                                coms.concat('component').forEach(function (com) {
                                    elems = elems.concat(_util2.default.elemToArray(rst.template.node.getElementsByTagName(com)));
                                });

                                elems.forEach(function (elem) {
                                    if (calculatedComs.indexOf(elem) === -1) {
                                        var comid = _util2.default.getComId(elem);
                                        [].slice.call(elem.attributes || []).forEach(function (attr) {
                                            if (attr.name !== 'id' && attr.name !== 'path') {
                                                if (/v-on:/.test(attr.name)) {
                                                    if (!events[comid]) events[comid] = {};
                                                    events[comid][attr.name] = attr.value;
                                                } else {
                                                    if (!props[comid]) props[comid] = {};
                                                    if (['hidden', 'wx:if', 'wx:elif', 'wx:else'].indexOf(attr.name) === -1) {
                                                        props[comid][attr.name] = attr.value;
                                                    }
                                                }
                                            }
                                        });
                                    }
                                });
                                if (Object.keys(props).length) {
                                    rst.script.code = rst.script.code.replace(/[\s\r\n]components\s*=[\s\r\n]*/, function (match, item, index) {
                                        return '$repeat = ' + JSON.stringify($repeat) + ';\r\n$props = ' + JSON.stringify(props) + ';\r\n$events = ' + JSON.stringify(events) + ';\r\n' + match;
                                    });
                                }
                            })();

                            if (rst.style.some(function (v) {
                                return v.scoped;
                            }) && rst.template.code) {
                                node = _this.createParser(opath).parseFromString(rst.template.code);

                                walkNode(node, rst.moduleId);

                                if (node.nodeType === 9 && !node.documentElement) {
                                    node.documentElement = node;
                                }

                                rst.template.code = node.toString();
                            }
                            _this._cacheWpys[filepath] = rst;
                            return _context.abrupt('return', _this._cacheWpys[filepath]);

                        case 31:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, _this);
        }))();
    },
    remove: function remove(opath, ext) {
        var src = _cache2.default.getSrc();
        var dist = _cache2.default.getDist();
        ext = ext || opath.substr(1);
        var target = _util2.default.getDistPath(opath, ext, src, dist);
        if (_util2.default.isFile(target)) {
            _util2.default.log('配置: ' + _path2.default.relative(_util2.default.currentDir, target), '删除');
            _fs2.default.unlinkSync(target);
        }
    },
    lint: function lint(filepath) {
        (0, _eslint2.default)(filepath);
    },
    compile: function compile(opath) {
        var _this2 = this;

        return _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
            var filepath, src, dist, wpyExt, pages, type, relative, wpy, mainPages, subPages, requires, k, tmp;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            filepath = _path2.default.join(opath.dir, opath.base);
                            src = _cache2.default.getSrc();
                            dist = _cache2.default.getDist();
                            wpyExt = _cache2.default.getExt();
                            pages = _cache2.default.getPages();
                            type = '';
                            relative = _path2.default.relative(_util2.default.currentDir, filepath);


                            if (filepath === _path2.default.join(_util2.default.currentDir, src, 'app' + wpyExt)) {
                                type = 'app';
                                _util2.default.log('入口: ' + relative, '编译');
                            } else if (pages.indexOf(relative) > -1) {
                                type = 'page';
                                _util2.default.log('页面: ' + relative, '编译');
                            } else if (relative.indexOf(_path2.default.sep + 'components' + _path2.default.sep) > -1) {
                                type = 'component';
                                _util2.default.log('组件: ' + relative, '编译');
                            } else {
                                _util2.default.log('Other: ' + relative, '编译');
                            }

                            if (!opath.npm) {
                                _this2.lint(filepath);
                            }

                            _context2.next = 11;
                            return _this2.resolveWpy(opath);

                        case 11:
                            wpy = _context2.sent;

                            if (wpy) {
                                _context2.next = 14;
                                break;
                            }

                            return _context2.abrupt('return');

                        case 14:

                            if (type === 'app') {
                                mainPages = wpy.config.pages.map(function (v) {
                                    return _path2.default.join(src, v + wpyExt);
                                });
                                subPages = [];

                                if (wpy.config.subPackages) {
                                    wpy.config.subPackages.forEach(function (sub) {
                                        sub.pages.forEach(function (v) {
                                            subPages.push(_path2.default.join(src, sub.root || '', v + wpyExt));
                                        });
                                    });
                                }
                                _cache2.default.setPages(mainPages.concat(subPages));

                                wpy.style.forEach(function (rst) {
                                    return rst.scoped = false;
                                });

                                delete wpy.template;
                            } else if (type === 'component') {
                                delete wpy.config;
                            }

                            if (wpy.config) {
                                _compileConfig2.default.compile(wpy.config, opath);
                            } else {
                                _this2.remove(opath, 'json');
                            }

                            if (wpy.style.length || wpy.template && wpy.template.components && Object.keys(wpy.template.components).length) {
                                requires = [];
                                k = void 0, tmp = void 0;

                                if (wpy.template) {
                                    for (k in wpy.template.components) {
                                        tmp = wpy.template.components[k];
                                        if (tmp.indexOf('.') === -1) {
                                            requires.push(tmp);
                                        } else {
                                            requires.push(_path2.default.join(opath.dir, wpy.template.components[k]));
                                        }

                                        requires = _util2.default.unique(requires);
                                    }
                                }
                                try {
                                    _compileStyle2.default.compile(wpy.style, requires, opath, wpy.moduleId);
                                } catch (e) {
                                    _util2.default.error(e);
                                }
                            } else {
                                _this2.remove(opath, 'wxss');
                            }

                            if (wpy.template && wpy.template.code && type !== 'component') {
                                wpy.template.npm = opath.npm;
                                _compileTemplate2.default.compile(wpy.template);
                            }

                            if (wpy.script.code) {
                                _compileScript2.default.compile(wpy.script.type, wpy.script.code, type, opath);
                            }

                        case 19:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, _this2);
        }))();
    }
};


function walkNode(node, moduleId) {
    if (node.childNodes) {
        [].slice.call(node.childNodes || []).forEach(function (child) {
            if (child.tagName) {
                var cls = child.getAttribute('class');
                child.setAttribute('class', (cls + ' ' + moduleId).trim());

                walkNode(child, moduleId);
            }
        });
    }
}
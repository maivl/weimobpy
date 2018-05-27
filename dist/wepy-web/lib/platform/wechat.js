'use strict';

exports.__esModule = true;

var _util = require('../helper/util');

var _query = require('../helper/query');

var wx = window.wx || {};

var wxbak = wx;
var k = void 0;
var callList = [];

for (k in wx) {
    if (k !== 'config' && k !== 'ready') {
        wx[k] = function () {
            if (wx.__ready) {
                wxbak[k].apply(wx, arguments);
            } else {
                callList.push([k, arguments]);
            }
        };
    }
}

wx.ready(function () {
    while (callList.length) {
        var item = callList.shift();
        wxbak[item[0]].apply(wx, item[1]);
    }
    wx.__ready = true;
});

wx.login = function (options) {
    var code = void 0;
    code = (0, _query.resolveQuery)(window.location.search).code;
    if (!code) {
        code = (0, _query.resolveQuery)(window.location.hash).code;
    }
    if (!code) {
        code = (0, _query.resolveQuery)(window.location.hash.substr(window.location.hash.indexOf('?'))).code;
    }
    if (code) {
        (0, _util.wxSuccess)('login', options, code);
        return;
    }
    if (options.appId) {
        var url = window.location.protocol + '//' + window.location.host + window.location.pathname,
            state = options.state || 'qqchongzhi',
            type = type || 'snsapi_base';

        window.location = location.protocol + '//open.weixin.qq.com/connect/oauth2/authorize?appid=' + options.appId + '&redirect_uri=' + encodeURIComponent(url) + '&response_type=code&scope=' + type + '&state=' + state + '#wechat_redirect';
    } else {
        (0, _util.wxFail)('login', options, '');
    }
};

wx.requestPayment = function (params) {
    wx.chooseWXPay(params);
};

wx.scanCode = function (params) {
    var QR_CODE = 'QR_CODE';
    var EAN_13 = 'EAN_13';

    wx.scanQRCode({
        needResult: 0,
        scanType: ['qrCode', 'barCode'], success: function success(res) {
            if (res.resultStr.includes(EAN_13)) {
                (0, _util.wxSuccess)('scanCode', params, {
                    result: res.resultStr.replace(/EAN_13,/g, ''),
                    scanType: EAN_13
                });
            } else {
                (0, _util.wxSuccess)('scanCode', params, {
                    result: res.resultStr,
                    scanType: QR_CODE
                });
            }
        }
    });
};

wx.__initShare = function (share) {
    wx.onMenuShareTimeline({
        title: share.title,
        link: share.url,
        imgUrl: share.img });
    wx.onMenuShareAppMessage({
        title: share.title,
        desc: share.desc,
        link: share.url,
        imgUrl: share.img });

    wx.onMenuShareQQ({
        title: share.title,
        desc: share.desc,
        link: share.url,
        imgUrl: share.img });
    wx.onMenuShareWeibo({
        title: share.title,
        desc: share.desc,
        link: share.url,
        imgUrl: share.img });
    wx.onMenuShareQZone({
        title: share.title,
        desc: share.desc,
        link: share.url,
        imgUrl: share.img });
};
wx.__hideShare = function () {};
wx.__platform = 'wechat';

if (typeof window !== 'undefined') {
    window.wx = wx;
}

exports.default = wx;
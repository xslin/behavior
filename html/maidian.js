/*
 * 生成UUID,用户唯一访问标识
 */
(function() {
    /**
     * 常量定义
     * @type {{FORESEE_MD_PROPERTY: string, CHARS: Array}}
     */
    var CONSTANT = {
        FORESEE_MD_PROPERTY: "foresee-md-property",
        V: "v_0.0.1"
    };
    Math.uuidFast = function() {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''),
            uuid = new Array(36),
            rnd = 0,
            r;
        for (var i = 0; i < 36; i++) {
            if (i == 8 || i == 13 || i == 18 || i == 23) {
                uuid[i] = '-';
            } else if (i == 14) {
                uuid[i] = '4';
            } else {
                if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
                r = rnd & 0xf;
                rnd = rnd >> 4;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
        return uuid.join('');
    };
    // 定义全局变量
    // 当用户进入页面我们就会启动一个定时器，这个定时器可以记录用户在该页面浏览时间
    var second = 0;
    var timeIn = Date.parse(new Date()) / 1000;
    window.setInterval(function() {
        second++;
    }, 1000);
    var params = {};
    var BuriedPoint = {
        isInit: false,
        URL: {
            // serverURL: "http://omni.esv.com.cn/behavior/fa.gif"
            serverURL: "http://127.0.0.1:18090/behavior/fa.gif"
        },
        /**
         * 构造get请求参数
         * @param params
         * @returns {string}
         */
        buildQueryString: function(params) {
            var params = params || {};
            // 拼接参数串
            var args = '';
            for (var i in params) {
                if (params[i] == '') {
                    continue;
                }
                if (args != '') {
                    args += '&';
                }
                // args += i + '=' + encodeURIComponent(params[i]);
                args += i + '=' + params[i];
            }
            return args;
        },
        /**
         * 加密参数
         * @param params
         * @returns {*|{}}
         */
        encryptParam: function(params) {
            var params = params || {};
            var paramsTemp = [];
            var str = "";
            for (var i in params) {
                if (params[i] == '') {
                    continue;
                }
                paramsTemp.push(i);
            }
            paramsTemp = paramsTemp.sort();
            for (var i in paramsTemp) {
                var k = paramsTemp[i]
                str += params[k]
            }
            params.si = Utils.md5(str);
            return params;
        },
        getCurrentUrl: function() {
            return document.URL || '';
        },
        getReferrer: function() {
            var referrer = '';
            try {
                referrer = window.top.document.referrer;
            } catch (e) {
                if (window.parent) {
                    try {
                        referrer = window.parent.document.referrer;
                    } catch (e2) {
                        referrer = '';
                    }
                }
            }
            if (referrer === '') {
                referrer = document.referrer;
            }
            return referrer;
        },
        // 识别客户终端类型
        resolveUserAgent: function(userAgent) {
            var browse = '';
            if (userAgent.indexOf("MSIE") >= 0) {
                browse = "ie";
            } else if (userAgent.indexOf("Firefox") >= 0) {
                userAgent = "Firefox";
            } else if (userAgent.indexOf("Chrome") >= 0) {
                browse = "Chrome";
            } else if (userAgent.indexOf("Opera") >= 0) {
                browse = "Opera";
            } else if (userAgent.indexOf("Safari") >= 0) {
                browse = "Safari";
            } else if (userAgent.indexOf("Netscape") >= 0) {
                browse = "Netscape";
            }
            return browse;
        },
        // 设置登陆用户信息
        setUser: function(param) {
            params.ui = param[1] || '';
            params.un = param[2] || '';
            params.ut = param[3] || '';
            params.uf = param[4] || '';
            if (params.ui == '' && params.un == '' && params.ut == '') {
                Utils.Cookie.removeCookie('_u');
            } else {
                var userInfo = 'ui=' + params.ui + '&un=' + params.un + '&ut=' + params.ut + '&uf=' + params.uf;
                Utils.Cookie.setCookie('_u', userInfo);
            }
        },
        // 记录页面PV
        trackPageView: function(param) {
            params.pl = param.pageURL || '';
            params.pt = param.pageTitle || '';
            this.sendData();
        },
        // 记录事件，例如关键字搜索.
        trackEvent: function(param) {
            params.ec = param.eventcategory || ''; // 类型分类
            params.ea = param.eventaction || ''; // 动作
            params.el = param.eventLabel || '';
            params.ev = param.eventValue || '';
            this.sendData();
        },
        // 设置公司信息
        setCompany: function(param) {
            params.ci = param[1] || ''; // 公司ID
            params.cn = param[2] || ''; // 公司名称
            if (params.ci == '' && params.cn == '') {
                Utils.Cookie.removeCookie('_c');
            } else {
                var companyInfo = 'ci=' + params.ci + '&cn=' + params.cn;
                Utils.Cookie.setCookie('_c', companyInfo);
            }
        },
        // 设置埋点JS是否自动获取PV
        setAutoPageView: function(autoPageView) {
            params.ap = autoPageView || true;
        },
        //设置自定义属性(key相同时覆盖，key不同时追加)
        setProperty: function(param) {
            var storageValue = sessionStorage.getItem(CONSTANT.FORESEE_MD_PROPERTY); //sessionStorage中的json字符串
            if (!storageValue) {
                sessionStorage.setItem(CONSTANT.FORESEE_MD_PROPERTY, JSON.stringify(param[1]));
            } else {
                sessionStorage.setItem(CONSTANT.FORESEE_MD_PROPERTY, JSON.stringify(Utils.mergeJson(param[1], JSON.parse(storageValue))));
            }
        },
        //清空sessionStorage
        delDefProperty: function() {
            sessionStorage.removeItem(CONSTANT.FORESEE_MD_PROPERTY);
        },
        //清楚自定义属性某个值
        delPropertyByKey: function(key) {
            var storageValue = sessionStorage.getItem(CONSTANT.FORESEE_MD_PROPERTY);
            var storageValueObj = JSON.parse(storageValue);
            for (var i = 1; i < key.length - 1; i++) {
                delete storageValueObj[key[i]];
            }
            json = JSON.stringify(storageValueObj);
            sessionStorage.setItem(CONSTANT.FORESEE_MD_PROPERTY, json);
        },
        // 识别被收集终端调用的API
        resolveApi: function() {
            if (typeof(_maq) != 'undefined' && _maq) {
                while ((param = _maq.shift())) {
                    switch (param[0]) {
                        case '_enableAutoCollect':
                            if (param[1]) {
                                this.initEvent();
                            }
                            break;
                        case '_setUser':
                            this.setUser(param);
                            break;
                        case '_trackPageview':
                            params.pl = param[1] || '';
                            params.pt = param[2] || '';
                            this.sendData();
                            break;
                        case '_setCustomVar':
                            params.index = param[1] || '';
                            params.name = param[2] || '';
                            params.value = param[3] || '';
                            params.opt_scope = param[4] || '';
                            break;
                        case '_trackEvent':
                            params.ec = param[1] || ''; // 类型分类
                            params.ea = param[2] || ''; // 动作
                            if (param[3]) {
                                params.el = param[3] || ''; // 事件标签
                            }
                            if (param[4]) {
                                params.ev = param[4] || ''; // 事件数值信息
                            }
                            this.sendData();
                            break;
                        case '_setAutoPageview':
                            params.ap = param[1] || '';
                            break;
                        case '_setCompany':
                            this.setCompany(param);
                            break;
                        case '_setDefProperty':
                            this.setProperty(param);
                            break;
                        case '_delDefProperty':
                            this.delDefProperty();
                            break;
                        case '_delDefPropertyByKey':
                            this.delPropertyByKey(param);
                            break;
                        default:
                            break;
                    }
                }
            }
        },
        // 如果设置了不自动获取页面pv时，则将用户自己设置的PV赋值给页面的url和title
        resolveAutoPageView: function(params) {
            if (!params.ap) {
                params.ul = params.ul + params.pl;
                params.te = params.pt;
            }
        },
        // 初始化参数
        initParams: function() {
            params.ap = true;
            // 系统参数收集
            // Document对象数据
            if (document) {
                params.da = document.domain || ''; // 访问的域名信息
                params.ul = document.URL && document.URL.split("?")[0] || ''; // 访问的URL
                params.te = document.title || ''; // 页面title
                params.re = this.getReferrer() || ''; // 从哪个路径过来
            }
            // Window对象数据
            if (window && window.screen) {
                var sh = window.screen.height || 0; // 用户屏幕高度
                var sw = window.screen.width || 0; // 用户屏幕宽度
                params.shw = sw + "x" + sh;
                params.cd = window.screen.colorDepth || 0; // 用户颜色深度
            }
            // navigator对象数据
            if (navigator) {
                params.la = navigator.language || ''; // 客户端使用语言
                params.br = this.resolveUserAgent(navigator.userAgent);
            }
            // 获取应用标识
            params.sc = Utils.getScriptArg("sc") || '';
            // 用户标识参数
            params.uk = this.getUk();
            params.v = CONSTANT.V;
            params.ep = sessionStorage.getItem(CONSTANT.FORESEE_MD_PROPERTY) || '';
            this.isInit = true;
        },
        // 构造请求参数对象,每次会重新构造请求参数，之前params对象已存在的参数会保留，如登陆用户信息，避免每次调用都要由调用方请求
        buildParams: function() {
            // 浏览时长参数
            params.ti = timeIn;
            params.to = Date.parse(new Date()) / 1000 + (second * 1000);
            params.ct = second;
            // 是否开启自动PV处理
            this.resolveAutoPageView(params);
            this.resolveUserCookie();
            this.resolveCompanyCookie();
            return params;
        },
        // 处理Cookie中的用户信息
        resolveUserCookie: function() {
            var userInfo = unescape(Utils.Cookie.getCookie('_u'));
            var ut = this.getQueryStringValue(userInfo, 'ut');
            var uf = this.getQueryStringValue(userInfo, 'uf');
            var un = this.getQueryStringValue(userInfo, 'un');
            var ui = this.getQueryStringValue(userInfo, 'ui');
            if (!params.ut && ut) {
                params.ut = ut;
            }
            if (!params.uf && uf) {
                params.uf = uf;
            }
            if (!params.un && un) {
                params.un = un;
            }
            if (!params.ui && ui) {
                params.ui = ui;
            }
        },
        // 处理Cookie中的企业信息
        resolveCompanyCookie: function() {
            var userInfo = unescape(Utils.Cookie.getCookie('_c'));
            var ci = this.getQueryStringValue(userInfo, 'ci');
            var cn = this.getQueryStringValue(userInfo, 'cn');
            if (!params.ci && ci) {
                params.ci = ci;
            }
            if (!params.cn && cn) {
                params.cn = cn;
            }
        },
        // 获取URL参数
        getQueryStringValue: function(queryString, name) {
            var userArr = queryString.split('&');
            for (var i = userArr.length - 1; i >= 0; i--) {
                var arr2 = userArr[i].split('=');
                if (arr2[0] == name) {
                    return arr2[1];
                }
            }
        },
        // 重置参数
        reset: function() {
            timeIn = Date.parse(new Date()) / 1000;
            second = 0;
            params.pl = '';
            params.pt = '';
            params.si = '';
            params.sk = '';
            params.ec = '';
            params.ev = '';
            params.el = '';
            params.ea = '';
            this.initParams();
        },
        getUk: function() {
            var _utmb = Utils.StorageUtils.setSessionStorageItem("_utmb");
            if (_utmb == null || _utmb == 'undefined' || _utmb == '') {
                _utmb = Math.uuidFast();
                Utils.StorageUtils.setSessionStorageItem("_utmb", _utmb);
            }
            return _utmb;
        },
        // 检查是否刷新过于频繁
        checkIsTooFast: function() {
            return false;
        },
        // 发送收集到的数据给到服务端
        sendData: function() {
            if (!this.isInit) {
                this.initParams();
            }
            var params = this.buildParams();
            params.sk = Math.uuidFast();
            params.qi = Math.uuidFast();
            params.ct = new Date().getTime();
            params = BuriedPoint.encryptParam(params); // 签名参数
            var queryString = BuriedPoint.buildQueryString(params);
            queryString = Utils.Base64.encodeBase64Url(queryString);
            var img = new Image(); // 创建一个image对象
            img.src = BuriedPoint.URL.serverURL + "?uri=" + queryString;
            img.style.display = 'none';
            document.body.appendChild(img);
            BuriedPoint.reset(); // 重置参数
        },
        // 添加事件监听
        addEvent: function(element, type, callback) {
            if (element.addEventListener) {
                element.addEventListener(type, callback, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + type, callback);
            }
        },
        //给没有执行_maq的button添加点击事件
        buttonAddEvent: function() {
            var btns = document.getElementsByTagName("button"); //所有的button
            for (var i = 0; i < btns.length; i++) {
                // if (btns[i]&&btns[i].getAttribute('onclick')&&btns[i].getAttribute('onclick').indexOf("_trackEvent") == -1) {
                this.addEvent(btns[i], 'click', function() {
                    var foreseeData = this.getAttribute('foresee-data') || ''; //ev
                    var ec = this.getAttribute('foresee-ec') || 'AUTO'; //ev
                    var ea = this.getAttribute('foresee-ea') || this.innerText; //ev
                    var el = this.getAttribute('foresee-ea') || ''; //ev
                    _maq.push(['_trackEvent', ec.trim(), ea.trim(), el.trim(), foreseeData.trim()]);
                });
                // }
            }
        },
        //给<a>标签添加点击事件
        aAddEvent: function() {
            var as = document.getElementsByTagName("a"); //所有的a标签
            for (var i = 0; i < as.length; i++) {
                // if (as[i]&&as[i].getAttribute('onclick') && as[i].getAttribute('onclick').indexOf("_trackEvent") == -1) {
                this.addEvent(as[i], 'click', function() {
                    var foreseeData = this.getAttribute('foresee-data') || ''; //ev
                    var ec = this.getAttribute('foresee-ec') || 'AUTO'; //ev
                    var ea = this.getAttribute('foresee-ea') || this.innerText; //ev
                    var el = this.getAttribute('foresee-ea') || ''; //ev
                    _maq.push(['_trackEvent', ec.trim(), ea.trim(), el.trim(), foreseeData.trim()]);
                });
                // }
            }
        },
        //初始化自动采集
        initEvent: function() {
            BuriedPoint.buttonAddEvent();
            BuriedPoint.aAddEvent();
        },
        setFi: function() {
            var url = this.getCurrentUrl().split("?")[0];
            Utils.StorageUtils.setSessionStorageItem(Utils.md5(url), params.pi);
        },
        getFi: function() {
            var referrer = this.getReferrer().split("?")[0];
            return Utils.StorageUtils.getSessionStorageItem(Utils.md5(referrer)) || '';
        },
        //把pi赋值给fi,把当前pi存到sessionStorage或者cookie
        setPiToFi: function() {
            params.fi = this.getFi();
        },
    };
    if (window.addEventListener) {
        window.addEventListener("load", load, false);
    } else if (window.attachEvent) {
        window.attachEvent("onload", load);
    } else if (window.onload) {
        window.onload = load;
    }

    function load() {
        //初始化相关参数
        params.pi = Math.uuidFast();
        BuriedPoint.setFi();
        BuriedPoint.setPiToFi();
        //数据解析与发送
        BuriedPoint.resolveApi();
        window.setInterval(function() {
            BuriedPoint.resolveApi(params);
        }, 1);
        BuriedPoint.sendData();
    };
    var Utils = {
        Base64: {
            // 转码表  
            /**
             * Base64url encoding (RFC4648)
             * http://tools.ietf.org/html/rfc4648
             *
             * @param {string} str
             * @returns {string}
             */
            encodeBase64Url: function(str) {
                if (typeof str !== 'string') {
                    return null;
                }
                str = Utils.Base64.encodeBase64(str);
                str = str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '.');
                // str = str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
                return str;
            },
            /**
             * Base64url decoding (RFC4648)
             * @param {string} $strBase64
             * @return {string}
             */
            decodeBase64Url: function(str) {
                if (typeof str !== 'string') {
                    return null;
                }
                // var mod = str.length % 4;
                // if (mod !== 0) {
                //     str += Utils.Base64.repeat('=', 4 - mod);
                // }
                str = str.replace(/-/g, '+').replace(/_/g, '/').replace(/=/g, '.');
                str = Utils.Base64.decodeBase64(str);
                return str;
            },
            /**
             * Repaet string
             *
             * @param {string} str
             * @param {integer} num
             * @returns {string}
             */
            repeat: function(str, num) {
                return new Array(num + 1).join(str);
            },
            /**
             * Native btoa with utf-8 encoding
             *
             * @param {string} str
             * @returns {string}
             */
            encodeBase64: function(str) {
                if (typeof str !== 'string') {
                    return null;
                }
                str = (str + '').toString();
                var strReturn = '';
                if (window.btoa) {
                    strReturn = window.btoa(unescape(encodeURIComponent(str)));
                } else {
                    strReturn = Utils.Base64.encodeBase64Fallback(str);
                }
                return strReturn;
            },
            /**
             * Native atob with utf-8 decoding
             *
             * @param {string} str
             * @returns {string}
             */
            decodeBase64: function(str) {
                if (typeof str !== 'string') {
                    return null;
                }
                str = (str + '').toString();
                var strReturn = '';
                if (window.atob) {
                    strReturn = decodeURIComponent(escape(window.atob(str)));
                } else {
                    strReturn = Utils.Base64.decodeBase64Fallback(str);
                }
                return strReturn;
            },
            encodeBase64Fallback: function(data) {
                var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
                    ac = 0,
                    enc = '',
                    tmp_arr = [];
                if (!data) {
                    return data;
                }
                data = unescape(encodeURIComponent(data));
                do {
                    // pack three octets into four hexets
                    o1 = data.charCodeAt(i++);
                    o2 = data.charCodeAt(i++);
                    o3 = data.charCodeAt(i++);
                    bits = o1 << 16 | o2 << 8 | o3;
                    h1 = bits >> 18 & 0x3f;
                    h2 = bits >> 12 & 0x3f;
                    h3 = bits >> 6 & 0x3f;
                    h4 = bits & 0x3f;
                    // use hexets to index into b64, and append result to encoded string
                    tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
                } while (i < data.length);
                enc = tmp_arr.join('');
                var r = data.length % 3;
                return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
            },
            decodeBase64Fallback: function(data) {
                var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
                var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
                    ac = 0,
                    dec = '',
                    tmp_arr = [];
                if (!data) {
                    return data;
                }
                data += '';
                do {
                    // unpack four hexets into three octets using index points in b64
                    h1 = b64.indexOf(data.charAt(i++));
                    h2 = b64.indexOf(data.charAt(i++));
                    h3 = b64.indexOf(data.charAt(i++));
                    h4 = b64.indexOf(data.charAt(i++));
                    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
                    o1 = bits >> 16 & 0xff;
                    o2 = bits >> 8 & 0xff;
                    o3 = bits & 0xff;
                    if (h3 == 64) {
                        tmp_arr[ac++] = String.fromCharCode(o1);
                    } else if (h4 == 64) {
                        tmp_arr[ac++] = String.fromCharCode(o1, o2);
                    } else {
                        tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
                    }
                } while (i < data.length);
                dec = tmp_arr.join('');
                return decodeURIComponent(escape(dec.replace(/\0+$/, '')));
            }
        },
        http: {
            getHost: function() {
                return window.location.host || '';
            }
        },
        /**
         * ajax请求
         * @param url
         * @param method
         * @param success
         */
        ajax: function(url, method, success) {
            var xhr;
            if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
                xhr = new XMLHttpRequest();
            } else { // code for IE6, IE5
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xhr.open(method, url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    success(xhr.responseText);
                }
            };
            xhr.send(null);
        },
        /**
         * 获取第一个引用JS后面的参数,也就本JS文件对应的URL后面的参数
         * @param key
         * @returns {*}
         */
        getScriptArg: function(key) { // 获取单个参数
            var src = document.getElementsByTagName("script")[0].src;
            return (src.match(new RegExp("(?:\\?|&)" + key + "=(.*?)(?=&|$)")) || ['', null])[1];
        },
        /**
         * 合并两个Json对象
         * @param n
         * @param o
         * @returns {*}
         */
        mergeJson: function(n, o) {
            for (var k in n) {
                for (var v in o) {
                    if (v != k) {
                        n[v] = o[v];
                    } else {
                        delete o[v];
                    }
                }
            }
            return n;
        },
        StorageUtils: {
            getSessionStorageItem: function(k) {
                return sessionStorage.getItem(k);
            },
            setSessionStorageItem: function(k, v) {
                sessionStorage.setItem(k, v);
            }
        },
        Cookie: {
            setCookie: function(name, value, seconds) {
                var cookieString = name + "=" + escape(value);
                // 判断是否设置过期时间
                if (seconds > 0) {
                    var d = new Date();
                    d.setTime(d.getTime() + seconds * 1000);
                    cookieString = cookieString + "; expires=" + d.toUTCString();
                }
                document.cookie = cookieString;
            },
            getCookie: function(name) {
                var arr = document.cookie.split('; ');
                for (var i = arr.length - 1; i >= 0; i--) {
                    var arr2 = arr[i].split('=');
                    if (arr2[0] == name) {
                        return arr2[1];
                    }
                }
                return '';
            },
            removeCookie: function(name) {
                this.setCookie(name, 1, -100000);
            }
        },
        // 将字符串转化为32位的MD5加密串
        md5: function(string) {
            function md5_RotateLeft(lValue, iShiftBits) {
                return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
            }

            function md5_AddUnsigned(lX, lY) {
                var lX4, lY4, lX8, lY8, lResult;
                lX8 = (lX & 0x80000000);
                lY8 = (lY & 0x80000000);
                lX4 = (lX & 0x40000000);
                lY4 = (lY & 0x40000000);
                lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
                if (lX4 & lY4) {
                    return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
                }
                if (lX4 | lY4) {
                    if (lResult & 0x40000000) {
                        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                    } else {
                        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                    }
                } else {
                    return (lResult ^ lX8 ^ lY8);
                }
            }

            function md5_F(x, y, z) {
                return (x & y) | ((~x) & z);
            }

            function md5_G(x, y, z) {
                return (x & z) | (y & (~z));
            }

            function md5_H(x, y, z) {
                return (x ^ y ^ z);
            }

            function md5_I(x, y, z) {
                return (y ^ (x | (~z)));
            }

            function md5_FF(a, b, c, d, x, s, ac) {
                a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_F(b, c, d), x), ac));
                return md5_AddUnsigned(md5_RotateLeft(a, s), b);
            };

            function md5_GG(a, b, c, d, x, s, ac) {
                a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_G(b, c, d), x), ac));
                return md5_AddUnsigned(md5_RotateLeft(a, s), b);
            };

            function md5_HH(a, b, c, d, x, s, ac) {
                a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_H(b, c, d), x), ac));
                return md5_AddUnsigned(md5_RotateLeft(a, s), b);
            };

            function md5_II(a, b, c, d, x, s, ac) {
                a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_I(b, c, d), x), ac));
                return md5_AddUnsigned(md5_RotateLeft(a, s), b);
            };

            function md5_ConvertToWordArray(string) {
                var lWordCount;
                var lMessageLength = string.length;
                var lNumberOfWords_temp1 = lMessageLength + 8;
                var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
                var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
                var lWordArray = Array(lNumberOfWords - 1);
                var lBytePosition = 0;
                var lByteCount = 0;
                while (lByteCount < lMessageLength) {
                    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                    lBytePosition = (lByteCount % 4) * 8;
                    lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
                    lByteCount++;
                }
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
                lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
                lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
                return lWordArray;
            };

            function md5_WordToHex(lValue) {
                var WordToHexValue = "",
                    WordToHexValue_temp = "",
                    lByte, lCount;
                for (lCount = 0; lCount <= 3; lCount++) {
                    lByte = (lValue >>> (lCount * 8)) & 255;
                    WordToHexValue_temp = "0" + lByte.toString(16);
                    WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
                }
                return WordToHexValue;
            };

            function md5_Utf8Encode(string) {
                string = string.replace(/\r\n/g, "\n");
                var utftext = "";
                for (var n = 0; n < string.length; n++) {
                    var c = string.charCodeAt(n);
                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    } else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                }
                return utftext;
            };
            var x = Array();
            var k, AA, BB, CC, DD, a, b, c, d;
            var S11 = 7,
                S12 = 12,
                S13 = 17,
                S14 = 22;
            var S21 = 5,
                S22 = 9,
                S23 = 14,
                S24 = 20;
            var S31 = 4,
                S32 = 11,
                S33 = 16,
                S34 = 23;
            var S41 = 6,
                S42 = 10,
                S43 = 15,
                S44 = 21;
            string = md5_Utf8Encode(string);
            x = md5_ConvertToWordArray(string);
            a = 0x67452301;
            b = 0xEFCDAB89;
            c = 0x98BADCFE;
            d = 0x10325476;
            for (k = 0; k < x.length; k += 16) {
                AA = a;
                BB = b;
                CC = c;
                DD = d;
                a = md5_FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
                d = md5_FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
                c = md5_FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
                b = md5_FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
                a = md5_FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
                d = md5_FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
                c = md5_FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
                b = md5_FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
                a = md5_FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
                d = md5_FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
                c = md5_FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
                b = md5_FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
                a = md5_FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
                d = md5_FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
                c = md5_FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
                b = md5_FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
                a = md5_GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
                d = md5_GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
                c = md5_GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
                b = md5_GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
                a = md5_GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
                d = md5_GG(d, a, b, c, x[k + 10], S22, 0x2441453);
                c = md5_GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
                b = md5_GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
                a = md5_GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
                d = md5_GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
                c = md5_GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
                b = md5_GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
                a = md5_GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
                d = md5_GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
                c = md5_GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
                b = md5_GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
                a = md5_HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
                d = md5_HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
                c = md5_HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
                b = md5_HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
                a = md5_HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
                d = md5_HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
                c = md5_HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
                b = md5_HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
                a = md5_HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
                d = md5_HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
                c = md5_HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
                b = md5_HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
                a = md5_HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
                d = md5_HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
                c = md5_HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
                b = md5_HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
                a = md5_II(a, b, c, d, x[k + 0], S41, 0xF4292244);
                d = md5_II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
                c = md5_II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
                b = md5_II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
                a = md5_II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
                d = md5_II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
                c = md5_II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
                b = md5_II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
                a = md5_II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
                d = md5_II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
                c = md5_II(c, d, a, b, x[k + 6], S43, 0xA3014314);
                b = md5_II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
                a = md5_II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
                d = md5_II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
                c = md5_II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
                b = md5_II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
                a = md5_AddUnsigned(a, AA);
                b = md5_AddUnsigned(b, BB);
                c = md5_AddUnsigned(c, CC);
                d = md5_AddUnsigned(d, DD);
            }
            return (md5_WordToHex(a) + md5_WordToHex(b) + md5_WordToHex(c) + md5_WordToHex(d)).toLowerCase();
        }
    }
})();
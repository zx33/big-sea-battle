var uuid = require('node-uuid');
var config = require('../conf/conf');
var util = {};
var http = require('http');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

util.init_router = function(router, get_map, post_map) {
    get_map.forEach(function(item) {
        var cmd = item.cmd;
        var func = item.func;
        router.get(cmd, func);
    });
    post_map.forEach(function(item) {
        var cmd = item.cmd;
        var func = item.func;
        router.post(cmd, func);
    });
}

util.return_json_response = function(status, msg, result) {
    return {
        status : status,
        msg : msg,
        result : result
    };
}

util.gen_guid = function() {
    return uuid.v1();
}

util.normallize_json = function(json) {
    for (var key in json) {
        if (json[key] instanceof Buffer) {
            json[key] = json[key].toString('utf-8');
        }
    }
}

util.safe_div = function(a,b) {
    if (0 == b) {
        return 0;
    } else {
        return 1.0 * a / b;
    }
}

util.now = function() {
    return parseInt((new Date()).getTime() / 1000);
}

util.simple_defer_callback = function(defer) {
    return function(err) {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve();
        }
    }
}

util.date_formate = function (d, fmt) { 
    var o = {
        "M+": d.getMonth() + 1,
        "d+": d.getDate(),
        "h+": d.getHours(),
        "m+": d.getMinutes(),
        "s+": d.getSeconds(),
        "q+": Math.floor((d.getMonth() + 3) / 3),
        "S": d.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

util.on_error = function(res) {
    return function(err) {
        if (!err instanceof String) {
            err = JSON.stringify(err);
        }
        res.send(util.return_json_response('error', err, {}));
    }
}

util.on_ok = function(res) {
    return function() {
        res.send(util.return_json_response('ok', '', {}));
    }
}

module.exports = util;
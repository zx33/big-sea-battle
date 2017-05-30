var Q = require('q');
var http = require('http');
var request = require('request');

var cookie_room_id = '';
var cookie_password = '';

function get_rival(nickname) {
    if (nickname == 'begoss') {
        return 'andybear';
    } else {
        return 'begoss';
    }
}

function new_game() {
    var defer = Q.defer();
    http.get(
        'http://localhost:2333/2.0/new_game?game_type=normal&sea_range=6',
        (res) => {
            var html = "";
            res.on('data', (data) => {
                html += data;
            });
            res.on('end', () => {
                var room_id = parseInt(JSON.parse(html).result.room_id);
                console.log('New game success', room_id);
                cookie_room_id = 'room_id=' + room_id + ';';
                defer.resolve(room_id);
            });
        }
    ).on('error', (err) => {
        defer.reject(err);
    });
    return defer.promise;
}

function join_game_all(room_id) {
    function join_game(nickname) {
        var defer = Q.defer();
        http.get(
            'http://localhost:2333/2.0/join_game?nickname=' + nickname + '&room_id=' + room_id,
            (res) => {
                var html = "";
                res.on('data', (data) => {
                    html += data;
                });
                res.on('end', () => {
                    var password = JSON.parse(html).result.password;
                    console.log(nickname, 'join game success', password);
                    cookie_password = 'password=' + password + ';';
                    defer.resolve(password);
                });
            }
        ).on('error', (err) => {
            defer.reject(err);
        });
        return defer.promise;
    }

    return Q.all([
        join_game('andybear'), 
        join_game('begoss')
    ]);
}

function set_map_all(password) {
    password = password[0];
    var map_info = '111000110000000000000000000000000000';

    function set_map(nickname) {
        var defer = Q.defer();
        var option = {
            url: 'http://localhost:2333/2.0/set_map',
            method: 'POST',
            headers: {
                Cookie: cookie_room_id + cookie_password + 'nickname=' + nickname + ';',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'map_info=' + map_info
        };
        request(option, (err, res, body) => {
            if (err || res.statusCode != 200) {
                defer.reject(err || "Error status code");
            } else {
                console.log(nickname, 'set map success');
                defer.resolve();
            }
        });
        return defer.promise;
    }

    return Q.all([
        set_map('andybear'),
        set_map('begoss')
    ]);
}

function get_turns() {
    var defer = Q.defer();
    var option = {
        url: 'http://localhost:2333/2.0/get_op?op_cnt=0',
        method: 'GET',
        headers: {
            Cookie: cookie_password + cookie_room_id + 'nickname=begoss;',
        }
    };
    request(option, (err, res, body) => {
        if (err || res.statusCode != 200) {
            defer.reject(err || "Error status code");
        } else {
            defer.resolve(JSON.parse(body).result.turns);
        }
    });
    return defer.promise;
}

function gen_kv_obj_str(args) {
    function gen_kv_obj(k, v) {
        return {
            k: k,
            v: v
        };
    }
    var arr = [];
    for (var i = 0; i < args.length; i += 2) {
        arr.push(gen_kv_obj(args[i], args[i+1]));
    }
    return arr.map((kv_obj) => {
        return kv_obj.k + '=' + kv_obj.v;
    }).join('&');
}

function boom(nickname, x, y) {
    return () => {
        var defer = Q.defer();
        var option = {
            url: 'http://localhost:2333/2.0/set_op',
            method: 'POST',
            headers: {
                Cookie: cookie_room_id + cookie_password + 'nickname=' + nickname + ';',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: gen_kv_obj_str(['x', x, 'y', y])
        };
        request(option, (err, res, body) => {
            if (err || res.statusCode != 200) {
                defer.reject(err || "Error status code");
            } else {
                console.log(nickname, 'boom', x, y, 'success');
                defer.resolve();
            }
        });
        return defer.promise;
    };
}

function boom_bingo_and_miss(nickname) {
    return boom(nickname, 0, 0)().then(boom(nickname, 2, 0));
}

function boom_miss(nickname) {
    return boom(nickname, 2, 0)();
}

function boom_all(nickname) {
    return boom(nickname, 0, 1)().then(boom(nickname, 0, 2)).then(boom(nickname, 1, 0)).then(boom(nickname, 1, 1));
}

function get_battle_status() {
    var defer = Q.defer();
    var option = {
        url: 'http://localhost:2333/2.0/curr_op_cnt',
        method: 'GET',
        headers: {
            Cookie: cookie_room_id + cookie_password + 'nickname=andybear',
        }
    };
    request(option, (err, res, body) => {
        if (err || res.statusCode != 200) {
            defer.reject(err || "Error status code");
        } else {
            defer.resolve(JSON.parse(body).result.op_cnt);
        }
    });
    return defer.promise;
}

function get_op(op_cnt) {
    var defer = Q.defer();
    var option = {
        url: 'http://localhost:2333/2.0/get_op?op_cnt=' + op_cnt,
        method: 'GET',
        headers: {
            Cookie: cookie_password + cookie_room_id + 'nickname=begoss;',
        }
    };
    request(option, (err, res, body) => {
        if (err || res.statusCode != 200) {
            defer.reject(err || "Error status code");
        } else {
            defer.resolve(JSON.parse(body));
        }
    });
    return defer.promise;
}

new_game()
    .then(join_game_all)
    .then(set_map_all)
    .then(get_turns)
    .then(boom_bingo_and_miss)
    .then(get_turns)
    .then(boom_miss)
    .then(get_turns)
    .then(boom_all)
    .then(get_battle_status)
    .then(get_op)
    .then(
        (ret) => {
            console.log(ret);
        },
        (err) => {
            console.log(err);
        }
    );
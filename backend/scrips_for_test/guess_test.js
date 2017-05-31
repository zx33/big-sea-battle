var Q = require('q');
var request = require('request');
var http = require('http');

var cookie_room_id = '';
var cookie_password = '';

function new_game() {
    var defer = Q.defer();
    http.get(
        'http://localhost:2333/2.0/new_game?game_type=guess&sea_range=6',
        (res) => {
            var html = '';
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
                var html = '';
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

function guess_all() {
    var map_info = '101010101010101010100000000000000000';

    function guess(nickname) {
        var defer = Q.defer();
        var option = {
            url: 'http://localhost:2333/2.0/guess',
            method: 'POST',
            headers: {
                Cookie: cookie_room_id + cookie_password + 'nickname=' + nickname + ';',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'map_info=' + map_info
        };
        request(option, (err, res, body) => {
            if (err || res.statusCode != 200) {
                defer.reject(err || 'Error status code');
            } else {
                console.log(nickname, 'guess success');
                defer.resolve();
            }
        });
        return defer.promise;
    }

    return Q.all([
        guess('andybear'),
        guess('begoss')
    ]);
}

function get_winner() {
    var defer = Q.defer();
    var option = {
        url: 'http://localhost:2333/2.0/get_winner',
        method: 'GET',
        headers: {
            Cookie: cookie_room_id + cookie_password + 'nickname=andybear;',
        }
    };
    request(option, (err, res, body) => {
        if (err || res.statusCode != 200) {
            defer.reject(err || "Error status code");
        } else {
            console.log('andybear get winner success');
            defer.resolve(JSON.parse(body));
        }
    });
    return defer.promise;
}

new_game()
    .then(join_game_all)
    .then(set_map_all)
    .then(guess_all)
    .then(get_winner)
    .then(
        (ret) => {
            console.log(ret);
        },
        (err) => {
            console.log(err);
        }
    );
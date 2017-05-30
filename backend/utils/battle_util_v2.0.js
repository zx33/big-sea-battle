var error_util = require('./error_util');
var common_util = require('./common');
var azz_util = require('./ai_util');
var my_util = {};

var game_type_map = {
    0: 'normal',
    1: 'speed',
    2: 'guess'
};

var status_map = {
    0: 'waiting player',
    1: 'setting map',
    2: 'gaming',
    3: 'end'
};

var range_ship_map = {
    6: 5,
    8: 12
};

function check_map(map, map_range) {
    if (map.length != map_range * map_range) {
        return false;
    } else {
        var ship_cnt = 0;
        map.forEach((x) => {
            ship_cnt += x;
        });
        if (ship_cnt != range_ship_map[map_range]) {
            return false;
        }
    }
    return true;
}

function map_range_check(x, map_range) {
    return x >= 0 && x < map_range;
}

function get_rival(players, nickname) {
    if (nickname == players[0]) {
        return players[1];
    } else {
        return players[0];
    }
}

function check_all_killed(map) {
    var ship_remain = 0;
    map.forEach((x) => {
        if (x == 1) ship_remain += 1;
    });
    return ship_remain == 0;
}

function calc_speed_winner(ops) {
    var bingo_map = {};
    var players = [];
    ops.forEach((op) => {
        if (!bingo_map[op.nickname]) {
            players.push(op.nickname);
            bingo_map[op.nickname] = 0;
        }
        bingo_map[op.nickname] += op.bingo;
    });
    if (bingo_map[players[0]] > bingo_map[players[1]]) {
        return 0;
    } else if (bingo_map[players[0]] < bingo_map[players[1]]) {
        return 1;
    } else {
        return -1;
    }
}

function check_guess_map(map, map_range) {
    var step_cnt = parseInt(map_range * map_range / 30);
    step_cnt *= 10;
    if (map.length != map_range * map_range) {
        return false;
    } else {
        var boom_cnt = 0;
        map.forEach((x) => {
            boom_cnt += x;
        });
        if (boom_cnt != step_cnt) {
            return false;
        }
    }
    return true;
}

my_util.gen_new_battle = (req, game_type, sea_range) => {
    var battle_index = req.battle_map.curr_max_room_id;
    req.battle_map.curr_max_room_id += 1;
    var battle = {
        game_type: game_type,
        sea_range: sea_range,
        password: common_util.gen_guid(),
        map_setted: 0,
        players: [],
        status: 0,
        turns: -2,
        ops: [],
        maps: {},
    };
    req.battle_map[battle_index] = battle;
    return battle_index;
}

my_util.join_game = (req, room_id, nickname, cb) => {
    if (room_id == -1) {
        return cb(error_util.err_no_room);
    }
    var battle = req.battle_map[room_id];
    if (!battle) {
        return cb(error_util.err_room_not_found);
    }
    if (battle.players.length == 2) {
        return cb(error_util.err_room_is_full);
    }
    if (nickname == '$$$') {
        nickname = "Visitor" + (battle.players.length + 1);
    }
    if (battle.players.length == 1) {
        if (nickname == battle.players[0]) {
            return cb(error_util.err_repeat_name);
        }
    }
    battle.players.push(nickname);
    if (battle.players.length == 2) {
        battle.turns = -1;
        battle.status += 1;
    }
    return cb(null, battle.password, battle.sea_range, battle.game_type);
}

my_util.set_map = (req, room_id, nickname, map_info, cb) => {
    var battle = req.battle_map[room_id];
    map_info = map_info.split('').map((x) => {
        return parseInt(x);
    });
    if (!check_map(map_info, battle.sea_range)) {
        return cb(error_util.err_map_info);
    }
    if (battle.maps[nickname]) {
        return cb(error_util.err_map_setted);
    }
    battle.maps[nickname] = map_info;
    battle.map_setted += 1;
    if (battle.map_setted == 2) {
        battle.turns = 0;
        battle.status += 1;
    }
    return cb(null);
}

my_util.get_status = (req, room_id, cb) => {
    var battle = req.battle_map[room_id];
    return cb(null, battle.status);
}

my_util.get_players = (req, room_id, cb) => {
    var battle = req.battle_map[room_id];
    return cb(null, battle.players);
}

my_util.get_current_op_count = (req, room_id, cb) => {
    var battle = req.battle_map[room_id];
    if (battle.status < 2) {
        return cb(error_util.err_not_start);
    }
    if (battle.game_type == 'guess') {
        return cb(error_util.err_request);
    }
    return cb(null, battle.ops.length);
}

my_util.get_op = (req, room_id, op_cnt, cb) => {
    if (!op_cnt) {
        return cb(error_util.err_op_cnt);
    } else {
        op_cnt = parseInt(op_cnt);
    }
    var battle = req.battle_map[room_id];
    var turns = battle.players[battle.turns];
    var is_end = battle.status == 3;
    if (op_cnt) {
        var op = battle.ops[op_cnt-1];
        return cb(null, op, turns, is_end);
    } else {
        return cb(null, null, turns, is_end);
    }
}

my_util.set_op = (req, room_id, nickname, x, y, cb) => {
    if (!x || !y) {
        return cb(error_util.err_coordinate);
    }
    x = parseInt(x);
    y = parseInt(y);
    var battle = req.battle_map[room_id];
    if (!(map_range_check(x, battle.sea_range) && map_range_check(y, battle.sea_range))) {
        return cb(error_util.err_out_of_range);
    }
    if (battle.status < 2) {
        return cb(error_util.err_not_start);
    }
    if (nickname != battle.players[battle.turns]) {
        return cb(error_util.err_op_turn);
    }

    var rival = get_rival(battle.players, nickname);
    var rival_map = battle.maps[rival];
    var index = x * battle.sea_range + y;

    if (rival_map[index] > 9) {
        return cb(error_util.err_repeat_op);
    }
    var op = {
        nickname: nickname,
        x: x,
        y: y,
        bingo: rival_map[index]
    };
    rival_map[index] += 10;
    battle.ops.push(op);
    if (battle.game_type == 'speed') {
        battle.turns += 1;
        battle.turns %= 2;
    } else {
        if (!op.bingo) {
            battle.turns += 1;
            battle.turns %= 2;
        }
    }
    var is_end = 0;
    if (check_all_killed(rival_map)) {
        var player_cnt = 0;
        if (battle.players[0] == nickname) {
            player_cnt = 0;
        } else {
            player_cnt = 1;
        }
        battle.has_winner = player_cnt;
        battle.status += 1;
        is_end = 1;
    } else if (battle.game_type == 'speed' && battle.ops.length == battle.sea_range * battle.sea_range) {
        battle.has_winner = calc_speed_winner(battle.ops);
        battle.status += 1;
        is_end = 1;
    }
    return cb(null, is_end);
}

my_util.guess = (req, room_id, nickname, map_info, cb) => {
    var battle = req.battle_map[room_id];

    function calc_guess_result() {
        var guess_ret = 0;
        var rival_map = battle.map[get_rival(nickname)];
        var map_length = rival_map.length;
        for (var i = 0; i < map_length; i++) {
            if (map_info[i] + rival_map[i] == 2) {
                guess_ret += 1;
            }
        }
        return guess_ret;
    }

    function calc_guess_winner() {
        var a = battle.players[0];
        var b = battle.players[1];
        if (battle.guess_ret[a] > battle.guess_ret[b]) {
            return 0;
        } else if (battle.guess_ret[a] < battle.guess_ret[b]) {
            return 1;
        } else {
            return -1;
        }
    }

    map_info = map_info.split('').map((x) => {
        return parseInt(x);
    });
    if (!check_guess_map(map_info)) {
        return cb(error_util.err_map_info);
    }
    if (!battle.guess_map) {
        battle.guess_map = {};
        battle.guess_cnt = 0;
        battle.guess_ret = {};
    }
    if (battle.guess_map[nickname]) {
        return cb(error_util.err_repeat_op);
    }
    var rival = get_rival(battle.players, nickname);
    battle.guess_map[nickname] = map_info;
    battle.guess_cnt += 1;
    battle.guess_ret[nickname] = calc_guess_result();
    if (battle.guess_cnt == 2) {
        battle.status += 1;
        battle.has_winner = calc_guess_winner();
    }
    cb(null, battle.map[rival], battle.guess_ret[nickname]);
}

my_util.get_winner = (req, room_id, cb) => {
    var battle = req.battle_map[room_id];
    if (battle.status != 3) {
        return cb(error_util.err_not_end);
    }
    if (battle.has_winner >= 0) {
        return cb(null, 1, battle.players[battle.has_winner]);
    } else {
        return cb(null, 0);
    }
}

module.exports = my_util;
var error_util = require('./error_util');
var common_util = require('./common');
var my_util = {};

function get_rival(players, nickname) {
    if (nickname == players[0]) {
        return players[1];
    } else {
        return players[0];
    }
}

function map_range_check(x) {
    return x >= 0 && x < 5;
}

function check_all_killed(map) {
    var ship_remain = 0;
    map.forEach((x) => {
        if (x == 1) ship_remain += 1;
    });
    return ship_remain == 0;
}

my_util.gen_new_battle = (req) => {
    var battle_index = req.battle_map.curr_max_room_id;
    req.battle_map.curr_max_room_id += 1;
    var battle = {
        password: common_util.gen_guid(),
        map_setted: 0,
        players: [],
        status: 'not end',
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
    if (nickname == "$$$") {
        nickname = "Player" + (battle.players.length + 1);
    }
    if (battle.players.length == 1) {
        if (nickname == battle.players[0]) {
            return cb(error_util.err_repeat_name);
        }
    }
    battle.players.push(nickname);
    if (battle.players.length == 2) {
        battle.turns = -1;
    }
    return cb(null, battle.password);
}

my_util.set_map = (req, room_id, nickname, map_info, cb) => {
    var battle = req.battle_map[room_id];
    map_info = map_info.split('').map((item) => {
        return parseInt(item);
    });
    if (map_info.length != 36) {
        return cb(error_util.err_map_info);
    }
    var ship_cnt = 0;
    map_info.forEach((x) => {
        ship_cnt += x;
    });
    if (ship_cnt != 5) {
        return cb(error_util.err_map_info);
    }
    if (battle.maps[nickname]) {
        return cb(error_util.err_map_setted);
    }
    battle.maps[nickname] = map_info;
    battle.map_setted += 1;
    if (battle.map_setted == 2) {
        battle.turns = 0;
    }
    return cb(null);
}

my_util.get_current_op_count = (req, room_id, cb) => {
    var battle = req.battle_map[room_id];
    if (battle.turns < 0) {
        return cb(error_util.err_not_start);
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
    if (op_cnt) {
        var op = battle.ops[op_cnt - 1];
        return cb(null, op, turns);
    } else {
        return cb(null, null, turns);
    }
}

my_util.set_op = (req, room_id, nickname, x, y, cb) => {
    if (!x || !y) {
        return cb(error_util.err_coordinate);
    }
    x = parseInt(x);
    y = parseInt(y);
    if (!(map_range_check(x) && map_range_check(y))) {
        return cb(error_util.err_out_of_range);
    }
    var battle = req.battle_map[room_id];
    if (battle.status == "end") {
        return cb(error_util.err_game_end);
    }
    if (battle.turns < 0) {
        return cb(error_util.err_not_start);
    }
    if (nickname != battle.players[battle.turns]) {
        return cb(error_util.err_op_turn);
    }
    var rival = get_rival(battle.players, nickname);
    var rival_map = battle.maps[rival];
    var index = x * 6 + y;
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
    if (!op.bingo) {
        battle.turns += 1;
        battle.turns %= 2;
    }
    var is_end = 0;
    if (check_all_killed(rival_map)) {
        battle.winner = nickname;
        battle.status = "end";
        is_end = 1;
    }
    return cb(null, is_end);
}

module.exports = my_util;
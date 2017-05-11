var error_util = require('./error_util');
var common_util = require('./common');
var my_util = {};

my_util.gen_new_battle = (req) => {
    var battle_index = req.battle_map.curr_max_room_id;
    req.battle_map.curr_max_room_id += 1;
    var battle = {
        password: common_util.gen_guid(),
        map_setted: 0,
        players: [],
        status: 'not end',
        turns: 0,
        ops: []
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
            nickname += "_0";
        }
    }
    battle.players.push(nickname);
    return cb(null, battle.password);
}

module.exports = my_util;
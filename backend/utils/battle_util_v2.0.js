var error_util = require('./error_util');
var common_util = require('./common');
var azz_util = require('./ai_util');
var my_util = {};

var status_map = {
    0: 'waiting player',
    1: 'setting map',
    2: 'pending',
    3: 'end'
};

var range_ship_map = {
    6: 5,
    10: 17
};

my_util.gen_new_battle = (req, game_type, sea_range) => {
    var battle_index = req.battle_map.curr_max_room_id;
    req.battle_map.curr_max_room_id += 1;
    var battle = {
        game_type: game_type,
        sea_range: sea_range,
        password: common_util.gen_guid(),
        map_setted: 0,
        players: [],
        status: status_map[0],
        turns: -2,
        ops: [],
        maps: {},
    };
    req.battle_map[battle_index] = battle;
    return battle_index;
}

my_util.join_game = (req, room_id, nickname, cb) => {
    
}

module.exports(my_util);
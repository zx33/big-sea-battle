var my_util = {};

my_util.gen_new_battle = (req) => {
    var battle_index = req.battle_map.curr_max_room_id;
    req.battle_map.curr_max_room_id += 1;
    var battle = {
        gamer_a: '',
        gamer_b: '',
        status: 'not end',
        ops: []
    };
    req.battle_map[battle_index] = battle;
    return battle_index;
}

module.exports = my_util;
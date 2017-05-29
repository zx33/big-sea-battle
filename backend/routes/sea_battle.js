var router = require('express').Router();
var user_check = require('../utils/user_check');
var battle_util = require('../utils/battle_util_v2.0');
var common_util = require('../utils/common');

function return_response(res) {
    return function(err, ret) {
        if (err) {
            common_util.on_error(res)(err);
        } else {
            if (!ret) {
                ret = {};
            }
            res.send(common_util.return_json_response('ok', '', ret));
        }
    }
}

router.get('/get_battle_status', (req, res) => {
    var ret = req.battle_map;
    return_response(res)(null, ret);
});

router.get('/new_game', (req, res) => {
    var game_type = req.query.game_type || "normal";
    var sea_range = parseInt(req.query.sea_range) || 6;
    var room_id = battle_util.gen_new_battle(req, game_type, sea_range);
    var ret = {
        room_id: room_id
    };
    return_response(res)(null, ret);
});

router.get('/join_game', (req, res) => {
    var room_id = parseInt(req.query.room_id) || -1;
    var nickname = req.query.nickname || '$$$';

    battle_util.join_game(req, room_id, nickname, (err, room_pwd) => {
        var ret = {
            password: room_pwd
        };
        return_response(res)(err, ret);
    });
});

router.post('/set_map', user_check, (req, res) => {
    var nickname = req.cookies.nickname;
    var room_id = parseInt(req.cookies.room_id);
    var map_info = req.body.map_info;

    battle_util.set_map(req, room_id, nickname, map_info, (err) => {
        return_response(res)(err);
    });
});

router.get('/get_status', user_check, (req, res) => {
    var room_id = parseInt(req.cookies.room_id);

    battle_util.get_status(req, room_id, (err, status) => {
        var ret = {
            status: status
        };
        return_response(res)(err, ret);
    });
});

router.get('/get_players', user_check, (req, res) => {
    var room_id = parseInt(req.cookies.room_id);

    battle_util.get_players(req, room_id, (err, players) => {
        var ret = {
            players: players
        };
        return_response(res)(err, players);
    });
});

router.get('/curr_op_cnt', user_check, (req, res) => {
    var room_id = parseInt(req.cookies.room_id);

    battle_util.get_current_op_count(req, room_id, (err, op_cnt) => {
        var ret = {
            op_cnt: op_cnt
        };
        return_response(res)(err, op_cnt);
    });
});

router.get('/get_op', user_check, (req, res) => {
    var room_id = parseInt(req.cookies.room_id);
    var op_cnt = req.query.op_cnt;

    battle_util.get_op(req, room_id, op_cnt, (err, op, turns, is_end) => {
        var ret = {
            op: op,
            turns: turns,
            is_end: is_end
        };
        return_response(res)(err, ret);
    });
});

router.post('/set_op', user_check, (req, res) => {
    var room_id = parseInt(req.cookies.room_id);
    var x = req.body.x;
    var y = req.body.y;
    var nickname = req.cookies.nickname;

    battle_util.set_op(req, room_id, nickname, x, y, (err, is_end) => {
        var ret = {
            game_status: is_end
        };
        return_response(res)(err, ret);
    });
});

router.get('/get_winner', user_check, (req, res) => {
    var room_id = parseInt(req.cookies.room_id);

    battle_util.get_winner(req, room_id, (err, has_winner, winner) => {
        var ret = {
            has_winner: has_winner,
            winner: winner
        };
        return_response(res)(err, ret);
    });
});

router.post('/guess', user_check, (req, res) => {
    var room_id = parseInt(req.cookies.room_id);
    var nickname = req.cookies.nickname;
    var map_info = req.body.map_info;

    battle_util.guess(req, room_id, nickname, map_info, (err, rival_map, bingo_cnt) => {
        var ret = {
            rival_map: rival_map,
            bingo_cnt: bingo_cnt
        };
        return_response(res)(err, ret);
    });
});

module.exports = router;
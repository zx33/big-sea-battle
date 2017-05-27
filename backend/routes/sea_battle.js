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
    var game_type = req.query.game_type;
    var sea_range = req.query.sea_range;
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



module.exports = router;
var express = require('express');
var router = express.Router();
var user_check = require('../utils/user_check');
var battle_util = require('../utils/battle_util');
var common_util = require('../utils/common');

router.get('/get_battle_status', (req, res) => {
    var ret = req.battle_map;
    res.send(common_util.return_json_response('ok', '', ret));
});

router.get('/new_game', (req, res) => {
    var room_id = battle_util.gen_new_battle(req);
    var ret = {
        room_id: room_id
    };
    res.send(common_util.return_json_response('ok', '', ret));
});

router.get('/join_game', (req, res) => {
    var room_id = parseInt(req.query.room_id) || -1;
    var nickname = req.query.nickname || "$$$";

    battle_util.join_game(req, room_id, nickname, (err, room_pwd) => {
        if (err) {
            common_util.on_error(res)(err);
        } else {
            var ret = {
                password: room_pwd
            };
            res.send(common_util.return_json_response('ok', '', ret));
        }
    });
});

router.post('/set_map', user_check, (req, res) => {
    var nickname = req.cookies.nickname;
    var room_id = parseInt(req.cookies.room_id);
    var map_info = req.body.map_info;

    battle_util.set_map(req, room_id, nickname, map_info, (err) => {
        if (err) {
            common_util.on_error(res)(err);
        } else {
            common_util.on_ok(res)();
        }
    });
});

module.exports = router;
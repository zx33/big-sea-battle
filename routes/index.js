var express = require('express');
var router = express.Router();
var battle_util = require('../utils/battle_util');
var common_util = require('../utils/common');

router.get('/new_game', (req, res) => {
    var room_id = battle_util.gen_new_battle(req);
    var ret = req.battle_map;
    res.send(common_util.return_json_response('ok', '', ret));
});

module.exports = router;
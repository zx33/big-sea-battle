var common_util = require('./common');
var error_util = require('./error_util');

module.exports = (req, res, next) => {
    var room_id = parseInt(req.cookies.room_id) || -1;
    var password = req.cookies.password || "";
    var nickname = req.cookies.nickname || "$$$";
    var battle =req.battle_map[room_id];
    
    if (!battle) {
        return common_util.on_error(res)(error_util.err_room_not_found);
    }
    if (
        battle.players.indexOf(nickname) == -1 || 
        password != battle.password
    ) {
        return common_util.on_error(res)(error_util.err_user_check);
    } else {
        return next();
    }
}
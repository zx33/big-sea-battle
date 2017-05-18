var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var index = require('./routes/index');
var common_util = require('./utils/common');
var fs = require('fs');

var folder = path.join(__dirname, 'battle_history');

var port = 2333;

var battle_map = {
    curr_max_room_id: 1,
};

var battle_status_checker = {};

function save_end_battle(battle_cnt, battle) {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }
    var filepath = path.join(folder, 'battle' + battle_cnt + '.log');
    fs.writeFileSync(filepath, JSON.stringify(battle), 'utf-8');
}

var check_battle_status = () => {
    console.log('battle check', common_util.date_formate((new Date()), 'yyyy-MM-dd hh:mm:ss'));
    for (var i in battle_map) {
        if (i == "curr_max_room_id") continue;
        if (!battle_status_checker[i]) {
            battle_status_checker[i] = 1;
        } else {
            if (battle_map[i].status == 'end') {
                save_end_battle(battle_map[i]);
            }
            delete battle_map[i];
        }
    }
}

setInterval(check_battle_status, 600000);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use((req, res, next) => {
    req.battle_map = battle_map;
    next();
});
app.use('/', index);

app.listen(port, () => {
    console.log('App is listening on ', port);
});
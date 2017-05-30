var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var index = require('./routes/index');
var index_v2 = require('./routes/sea_battle');
var common_util = require('./utils/common');
var fs = require('fs');
var mongoclient = require('mongodb').MongoClient;

var folder = path.join(__dirname, 'battle_history');
var mongodb_url = '' // Insert your mongodb url here.
var port = 2333;
var server_start_time = common_util.date_formate((new Date()), 'yyyy-MM-dd hh:mm:ss');

var battle_map = {
    curr_max_room_id: 1,
};

var battle_status_checker = {};

function save_end_battle(battle_cnt, battle) {
    console.log('battle save', battle_cnt, server_start_time);
    mongoclient.connect(mongodb_url, (err, db) => {
        if (err) {
            console.log(err);
        } else {
            db.collection('battle_history')
                .insert(battle, {}, (err) => {
                    if (err) {
                        console.log('history save error', err);
                    } else {
                        console.log(battle_cnt, 'battle saved');
                    }
                    db.close();
                });
        }
    });
}

var check_battle_status = () => {
    console.log('battle check', common_util.date_formate((new Date()), 'yyyy-MM-dd hh:mm:ss'));
    for (var i in battle_map) {
        if (i == "curr_max_room_id") continue;
        if (!battle_status_checker[i]) {
            battle_status_checker[i] = 1;
        } else {
            if (battle_map[i].status == 'end') {
                battle_map[i].verson = 1.0;
                save_end_battle(i, battle_map[i]);
            } else if (battle_map[i].status == 3) {
                battle_map[i].verson = 2.0;
                save_end_battle(i, battle_map[i]);
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
app.use('/2.0', index_v2);

app.listen(port, () => {
    console.log('App is listening on ', port);
});
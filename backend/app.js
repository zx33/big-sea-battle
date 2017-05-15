var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var config = require('./conf/conf');
var index = require('./routes/index');

var port = 2333;

var battle_map = {
    curr_max_room_id: 1,
};

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
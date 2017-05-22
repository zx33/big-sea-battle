var my_util = {};

function check_map_available(map) {
    var flag = 0;
    map.forEach((x) => {
        if (x > 1) flag++;
    });
    return flag == 0;
}

var fx1 = [[1, 3], [3, 1]];
var fx2 = [[1, 2], [2, 1]];

function get_map(x1, y1, op1, x2, y2, op2) {
    var map = [];
    for (var i = 0; i < 36; i++) {
        map.push(0);
    }
    for (var i = x1; i < x1 + fx1[op1][0]; i++) {
        for (var j = y1; j < y1 + fx1[op1][1]; j++) {
            var index = i * 6 + j;
            map[index] += 1;
        }
    }
    for (var i = x2; i < x2 + fx2[op2][0]; i++) {
        for (var j = y2; j < y2 + fx2[op2][1]; j++) {
            var index = i * 6 + j;
            map[index] += 1;
        }
    }
    return map;
}

function get_all_available_map() {
    var all_available_map = [];
    var fx = [0, 1];
    var zb = [0, 1, 2, 3, 4, 5];
    zb.forEach((x1) => {
        zb.forEach((x2) => {
            zb.forEach((y1) => {
                zb.forEach((y2) => {
                    fx.forEach((op1) => {
                        fx.forEach((op2) => {
                            if (
                                x1 + fx1[op1][0] <= 6 &&
                                y1 + fx1[op1][1] <= 6 && 
                                x2 + fx2[op2][0] <= 6 &&
                                y2 + fx2[op2][1] <= 6
                            ) {
                                var map = get_map(x1, y1, op1, x2, y2, op2);
                                if (check_map_available(map)) {
                                    all_available_map.push(map);
                                }
                            }
                        });
                    });
                });
            });
        });
    });
    return all_available_map;
}

function get_next_step_range(curr_map) {
    var map_cnt = [];
    for (var i = 0; i < 36; i++) {
        map_cnt.push(0);
    }
    var map_info = [];
    curr_map.forEach((x, i) => {
        if (x >= 10) {
            map_cnt[i] = -5000;
            var ret = {
                index: i,
                sea_info: x - 10
            };
            map_info.push(ret);
        }
    });
    var all_available_map = get_all_available_map();
    map_info.forEach((x) => {
        var available_map = [];
        all_available_map.forEach((m) => {
            if (m[x.index] == x.sea_info) {
                available_map.push(m);
            }
        });
        all_available_map = available_map;
    });
    console.log(all_available_map.length);
    all_available_map.forEach((m) => {
        console.log(2333, "map info");
        console.log('\t', m[0], m[1], m[2], m[3], m[4], m[5]);
        console.log('\t', m[6], m[7], m[8], m[9], m[10], m[11]);
        console.log('\t', m[12], m[13], m[14], m[15], m[16], m[17]);
        console.log('\t', m[18], m[19], m[20], m[21], m[22], m[23]);
        console.log('\t', m[24], m[25], m[26], m[27], m[28], m[29]);
        console.log('\t', m[30], m[31], m[32], m[33], m[34], m[35]);
        m.forEach((x, i) => {
            map_cnt[i] += x;
        });
    });
    var maxcnt = 0;
    map_cnt.forEach((x) => {
        maxcnt = Math.max(maxcnt, x);
    });
    var ret = [];
    map_cnt.forEach((x, i) => {
        if (x == maxcnt) {
            ret.push(i);
        }
    });
    return ret;
}

var map = [];
for (var i = 0; i < 36; i++) {
    map.push(0);
}


map[15] = 10;
map[20] = 10;
map[10] = 11;
map[9] = 11;
map[8] = 10;
map[11] = 11;
map[27] = 10;
map[13] = 10;
map[25] = 10;
map[17] = 10;
map[22] = 11;
var ret = get_next_step_range(map);
console.log(ret);

module.exports = my_util;
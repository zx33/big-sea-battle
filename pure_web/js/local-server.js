/**
 * 本地服务器模拟 - 将后端逻辑转移到前端实现
 * 这个文件模拟了原本在后端实现的游戏逻辑，使游戏可以完全在前端运行
 */

// 本地服务器对象
const LocalServer = {
    // 游戏数据存储
    battleMap: {
        currMaxRoomId: 1
    },
    
    // 错误代码映射
    errorCodes: {
        err_no_room: { code: 1001, msg: '房间不存在' },
        err_room_not_found: { code: 1002, msg: '找不到指定房间' },
        err_room_is_full: { code: 1003, msg: '房间已满' },
        err_repeat_name: { code: 1004, msg: '昵称重复' },
        err_map_info: { code: 1005, msg: '地图信息错误' },
        err_map_setted: { code: 1006, msg: '地图已设置' },
        err_not_start: { code: 1007, msg: '游戏未开始' },
        err_request: { code: 1008, msg: '请求错误' },
        err_op_cnt: { code: 1009, msg: '操作计数错误' },
        err_coordinate: { code: 1010, msg: '坐标错误' },
        err_out_of_range: { code: 1011, msg: '超出范围' },
        err_op_turn: { code: 1012, msg: '不是你的回合' },
        err_repeat_op: { code: 1013, msg: '重复操作' },
        err_not_end: { code: 1014, msg: '游戏未结束' }
    },
    
    // 游戏类型映射
    gameTypeMap: {
        0: 'normal',
        1: 'speed',
        2: 'guess'
    },
    
    // 状态映射
    statusMap: {
        0: 'waiting player',
        1: 'setting map',
        2: 'gaming',
        3: 'end'
    },
    
    // 不同大小地图对应的舰船数量
    rangeShipMap: {
        6: 5,
        8: 12
    },
    
    // 初始化本地服务器
    init: function() {
        console.log('本地服务器已初始化');
        
        // 拦截API请求并重定向到本地处理函数
        this.setupAPIInterceptor();
    },
    
    // 设置API拦截器
    setupAPIInterceptor: function() {
        const self = this;
        
        // 保存原始的jQuery ajax方法
        const originalAjax = $.ajax;
        
        // 重写jQuery ajax方法
        $.ajax = function(options) {
            const url = options.url || '';
            
            // 检查是否是游戏API请求
            if (url.includes('/2.0/')) {
                return self.handleAPIRequest(options);
            }
            
            // 非游戏API请求使用原始方法
            return originalAjax.apply(this, arguments);
        };
        
        // 重写jQuery get方法
        $.get = function(url, data, callback, type) {
            // 处理参数
            if ($.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }
            
            return $.ajax({
                url: url,
                type: 'GET',
                data: data,
                success: callback,
                dataType: type
            });
        };
        
        // 重写jQuery post方法
        $.post = function(url, data, callback, type) {
            // 处理参数
            if ($.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }
            
            return $.ajax({
                url: url,
                type: 'POST',
                data: data,
                success: callback,
                dataType: type
            });
        };
    },
    
    // 处理API请求
    handleAPIRequest: function(options) {
        const url = options.url;
        const method = options.type || 'GET';
        const data = options.data || {};
        const success = options.success || function() {};
        const error = options.error || function() {};
        
        // 提取API路径
        const apiPath = url.split('/2.0/')[1];
        
        // 模拟网络延迟
        setTimeout(() => {
            try {
                // 根据API路径分发到对应处理函数
                let result;
                
                if (apiPath === 'new_game') {
                    result = this.handleNewGame(data);
                } else if (apiPath === 'join_game') {
                    result = this.handleJoinGame(data);
                } else if (apiPath === 'get_status') {
                    result = this.handleGetStatus(data);
                } else if (apiPath === 'get_players') {
                    result = this.handleGetPlayers(data);
                } else if (apiPath === 'set_map') {
                    result = this.handleSetMap(data);
                } else if (apiPath === 'curr_op_cnt') {
                    result = this.handleGetCurrentOpCount(data);
                } else if (apiPath === 'get_op') {
                    result = this.handleGetOp(data);
                } else if (apiPath === 'set_op') {
                    result = this.handleSetOp(data);
                } else if (apiPath === 'get_winner') {
                    result = this.handleGetWinner(data);
                } else if (apiPath === 'guess') {
                    result = this.handleGuess(data);
                } else {
                    // 未知API
                    throw { code: 404, msg: '未知API' };
                }
                
                // 调用成功回调
                success(this.returnJsonResponse('ok', '', result));
            } catch (err) {
                // 调用错误回调
                error(this.returnJsonResponse('error', err.msg || '未知错误', null));
            }
        }, 200); // 模拟200ms网络延迟
        
        // 返回一个Promise对象以兼容jQuery ajax
        return {
            done: function(callback) {
                this.successCallback = callback;
                return this;
            },
            fail: function(callback) {
                this.errorCallback = callback;
                return this;
            },
            always: function(callback) {
                this.alwaysCallback = callback;
                return this;
            }
        };
    },
    
    // 返回标准JSON响应
    returnJsonResponse: function(status, msg, result) {
        return {
            status: status,
            msg: msg,
            result: result
        };
    },
    
    // 获取Cookie值
    getCookie: function(name) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.startsWith(name + '=')) {
                return cookie.substring(name.length + 1);
            }
        }
        return '';
    },
    
    // 检查地图是否有效
    checkMap: function(map, mapRange) {
        if (map.length != mapRange * mapRange) {
            return false;
        } else {
            let shipCnt = 0;
            map.forEach((x) => {
                shipCnt += x;
            });
            if (shipCnt != this.rangeShipMap[mapRange]) {
                return false;
            }
        }
        return true;
    },
    
    // 检查坐标是否在范围内
    mapRangeCheck: function(x, mapRange) {
        return x >= 0 && x < mapRange;
    },
    
    // 获取对手昵称
    getRival: function(players, nickname) {
        if (nickname == players[0]) {
            return players[1];
        } else {
            return players[0];
        }
    },
    
    // 检查是否全部击沉
    checkAllKilled: function(map) {
        let shipRemain = 0;
        map.forEach((x) => {
            if (x == 1) shipRemain += 1;
        });
        return shipRemain == 0;
    },
    
    // 计算竞速模式胜者
    calcSpeedWinner: function(ops) {
        const bingoMap = {};
        const players = [];
        ops.forEach((op) => {
            if (!bingoMap[op.nickname]) {
                players.push(op.nickname);
                bingoMap[op.nickname] = 0;
            }
            bingoMap[op.nickname] += op.bingo;
        });
        if (bingoMap[players[0]] > bingoMap[players[1]]) {
            return 0;
        } else if (bingoMap[players[0]] < bingoMap[players[1]]) {
            return 1;
        } else {
            return -1;
        }
    },
    
    // 检查猜测地图是否有效
    checkGuessMap: function(map, mapRange) {
        const stepCnt = parseInt(mapRange * mapRange / 30) * 10;
        if (map.length != mapRange * mapRange) {
            return false;
        } else {
            let boomCnt = 0;
            map.forEach((x) => {
                boomCnt += x;
            });
            if (boomCnt != stepCnt) {
                return false;
            }
        }
        return true;
    },
    
    // 生成随机地图 (AI用)
    generateRandomMap: function(seaRange) {
        const shipCount = this.rangeShipMap[seaRange];
        const map = Array(seaRange * seaRange).fill(0);
        const shipSizes = Game.shipSizes[seaRange];
        
        // 随机放置每艘舰船
        for (let i = 0; i < shipSizes.length; i++) {
            const shipSize = shipSizes[i];
            let placed = false;
            
            // 尝试放置直到成功
            while (!placed) {
                // 随机选择方向 (0: 水平, 1: 垂直)
                const isHorizontal = Math.random() < 0.5;
                
                // 随机选择起始位置
                const maxX = isHorizontal ? seaRange : seaRange - shipSize;
                const maxY = isHorizontal ? seaRange - shipSize : seaRange;
                const x = Math.floor(Math.random() * maxX);
                const y = Math.floor(Math.random() * maxY);
                
                // 检查是否可以放置
                let canPlace = true;
                for (let j = 0; j < shipSize; j++) {
                    const cellX = isHorizontal ? x : x + j;
                    const cellY = isHorizontal ? y + j : y;
                    const index = cellX * seaRange + cellY;
                    
                    if (map[index] === 1) {
                        canPlace = false;
                        break;
                    }
                }
                
                // 如果可以放置，则放置舰船
                if (canPlace) {
                    for (let j = 0; j < shipSize; j++) {
                        const cellX = isHorizontal ? x : x + j;
                        const cellY = isHorizontal ? y + j : y;
                        const index = cellX * seaRange + cellY;
                        map[index] = 1;
                    }
                    placed = true;
                }
            }
        }
        
        return map;
    },
    
    // 生成AI猜测地图
    generateAIGuessMap: function(seaRange) {
        const stepCnt = parseInt(seaRange * seaRange / 30) * 10;
        const map = Array(seaRange * seaRange).fill(0);
        const positions = [];
        
        // 生成所有可能的位置
        for (let i = 0; i < seaRange * seaRange; i++) {
            positions.push(i);
        }
        
        // 随机选择stepCnt个位置
        for (let i = 0; i < stepCnt; i++) {
            const randomIndex = Math.floor(Math.random() * positions.length);
            const position = positions.splice(randomIndex, 1)[0];
            map[position] = 1;
        }
        
        return map;
    },
    
    // 处理创建游戏请求
    handleNewGame: function(data) {
        const gameType = data.game_type || 'normal';
        const seaRange = parseInt(data.sea_range) || 6;
        
        // 生成新的房间ID
        const battleIndex = this.battleMap.currMaxRoomId;
        this.battleMap.currMaxRoomId += 1;
        
        // 创建新的游戏对象
        const battle = {
            game_type: gameType,
            sea_range: seaRange,
            password: this.generateGUID(),
            map_setted: 0,
            players: ['AI'],  // 自动添加AI玩家
            status: 0,
            turns: -2,
            ops: [],
            maps: {}
        };
        
        console.log('创建新游戏，自动添加AI玩家');
        
        // 存储游戏对象
        this.battleMap[battleIndex] = battle;
        
        return {
            room_id: battleIndex
        };
    },
    
    // 处理加入游戏请求
    handleJoinGame: function(data) {
        const roomId = parseInt(data.room_id) || -1;
        let nickname = data.nickname || '$$$';
        
        if (roomId === -1) {
            throw this.errorCodes.err_no_room;
        }
        
        const battle = this.battleMap[roomId];
        if (!battle) {
            throw this.errorCodes.err_room_not_found;
        }
        
        if (battle.players.length === 2) {
            throw this.errorCodes.err_room_is_full;
        }
        
        if (nickname === '$$$') {
            nickname = "Visitor" + (battle.players.length);
        }
        
        // 检查昵称是否与AI重复
        if (nickname === 'AI') {
            throw this.errorCodes.err_repeat_name;
        }
        
        battle.players.push(nickname);
        battle.turns = -1;
        battle.status += 1;
        
        // 为AI玩家生成随机地图
        const aiMap = this.generateRandomMap(battle.sea_range);
        battle.maps['AI'] = aiMap;
        battle.map_setted += 1;
        
        console.log('玩家加入游戏，AI地图已生成');

        
        return {
            password: battle.password,
            sea_range: battle.sea_range,
            game_type: battle.game_type
        };
    },
    
    // 处理设置地图请求
    handleSetMap: function(data) {
        const roomId = parseInt(this.getCookie('room_id'));
        const nickname = this.getCookie('nickname');
        let mapInfo = data.map_info;
        
        const battle = this.battleMap[roomId];
        mapInfo = mapInfo.split('').map((x) => {
            return parseInt(x);
        });
        
        if (!this.checkMap(mapInfo, battle.sea_range)) {
            throw this.errorCodes.err_map_info;
        }
        
        if (battle.maps[nickname]) {
            throw this.errorCodes.err_map_setted;
        }
        
        battle.maps[nickname] = mapInfo;
        battle.map_setted += 1;
        console.log(`玩家 ${nickname} 设置了地图，当前已设置地图数: ${battle.map_setted}`);
        
        // 检查是否需要为AI生成地图
        if (battle.players.length === 2) {
            const aiNickname = this.getRival(battle.players, nickname);
            
            // 如果AI尚未设置地图，自动为其生成
            if (!battle.maps[aiNickname]) {
                console.log(`为AI玩家 ${aiNickname} 生成随机地图`);
                const aiMap = this.generateRandomMap(battle.sea_range);
                battle.maps[aiNickname] = aiMap;
                battle.map_setted += 1;
                console.log(`AI玩家地图已生成，当前已设置地图数: ${battle.map_setted}`);
            }
        }
        
        // 如果双方都已设置地图，开始游戏
        if (battle.map_setted === 2) {
            battle.turns = 0;
            battle.status += 1;
            console.log('游戏开始，状态更新为:', battle.status);
        } else {
            console.log('等待所有玩家设置地图，当前状态:', battle.status);
        }
        
        return {};
    },
    
    // 处理获取游戏状态请求
    handleGetStatus: function(data) {
        const roomId = parseInt(this.getCookie('room_id'));
        const battle = this.battleMap[roomId];
        
        return {
            status: battle.status
        };
    },
    
    // 处理获取玩家信息请求
    handleGetPlayers: function(data) {
        const roomId = parseInt(this.getCookie('room_id'));
        const battle = this.battleMap[roomId];
        
        return {
            players: battle.players
        };
    },
    
    // 处理获取当前操作数请求
    handleGetCurrentOpCount: function(data) {
        const roomId = parseInt(this.getCookie('room_id'));
        const battle = this.battleMap[roomId];
        
        if (battle.status < 2) {
            throw this.errorCodes.err_not_start;
        }
        
        if (battle.game_type === 'guess') {
            throw this.errorCodes.err_request;
        }
        
        return {
            op_cnt: battle.ops.length
        };
    },
    
    // 处理获取操作详情请求
    handleGetOp: function(data) {
        const roomId = parseInt(this.getCookie('room_id'));
        let opCnt = data.op_cnt;
        
        if (!opCnt && opCnt !== 0) {
            opCnt = 0;
        } else {
            opCnt = parseInt(opCnt);
        }
        
        const battle = this.battleMap[roomId];
        const turns = battle.players[battle.turns];
        const isEnd = battle.status === 3;
        
        // 如果是AI的回合，自动进行AI操作
        if (turns !== Game.nickname && battle.status === 2) {
            this.performAIOperation(roomId, turns);
        }
        
        if (opCnt > 0) {
            const op = battle.ops[opCnt - 1];
            return {
                op: op,
                turns: turns,
                is_end: isEnd
            };
        } else {
            return {
                op: null,
                turns: turns,
                is_end: isEnd
            };
        }
    },
    
    // 执行AI操作
    performAIOperation: function(roomId, aiNickname) {
        const battle = this.battleMap[roomId];
        const playerNickname = Game.nickname;
        
        // 如果不是AI回合或游戏已结束，不执行操作
        if (battle.turns !== battle.players.indexOf(aiNickname) || battle.status !== 2) {
            return;
        }
        
        // 获取玩家地图
        const playerMap = battle.maps[playerNickname];
        const seaRange = battle.sea_range;
        
        // 生成可能的攻击位置列表
        const possibleMoves = [];
        for (let i = 0; i < seaRange; i++) {
            for (let j = 0; j < seaRange; j++) {
                const index = i * seaRange + j;
                // 只考虑未攻击过的位置
                if (playerMap[index] < 10) {
                    possibleMoves.push({ x: i, y: j, index: index });
                }
            }
        }
        
        // 如果没有可能的移动，返回
        if (possibleMoves.length === 0) {
            return;
        }
        
        // 随机选择一个位置攻击
        const randomIndex = Math.floor(Math.random() * possibleMoves.length);
        const move = possibleMoves[randomIndex];
        
        // 执行攻击
        this.executeAttack(roomId, aiNickname, move.x, move.y);
    },
    
    // 执行攻击操作
    executeAttack: function(roomId, nickname, x, y) {
        const battle = this.battleMap[roomId];
        const rival = this.getRival(battle.players, nickname);
        const rivalMap = battle.maps[rival];
        const index = x * battle.sea_range + y;
        
        // 检查是否已经攻击过
        if (rivalMap[index] > 9) {
            return false;
        }
        
        // 创建操作对象
        const op = {
            nickname: nickname,
            x: x,
            y: y,
            bingo: rivalMap[index]
        };
        
        // 更新地图
        rivalMap[index] += 10;
        battle.ops.push(op);
        
        // 更新回合
        if (battle.game_type === 'speed') {
            battle.turns += 1;
            battle.turns %= 2;
        } else {
            if (!op.bingo) {
                battle.turns += 1;
                battle.turns %= 2;
            }
        }
        
        // 检查游戏是否结束
        let isEnd = 0;
        if (this.checkAllKilled(rivalMap)) {
            const playerCnt = battle.players.indexOf(nickname);
            battle.has_winner = playerCnt;
            battle.status += 1;
            isEnd = 1;
        } else if (battle.game_type === 'speed' && battle.ops.length === battle.sea_range * battle.sea_range) {
            battle.has_winner = this.calcSpeedWinner(battle.ops);
            battle.status += 1;
            isEnd = 1;
        }
        
        return isEnd;
    },
    
    // 处理设置操作请求
    handleSetOp: function(data) {
        const roomId = parseInt(this.getCookie('room_id'));
        const nickname = this.getCookie('nickname');
        let x = data.x;
        let y = data.y;
        
        if (x === undefined || y === undefined) {
            throw this.errorCodes.err_coordinate;
        }
        
        x = parseInt(x);
        y = parseInt(y);
        
        const battle = this.battleMap[roomId];
        
        if (!(this.mapRangeCheck(x, battle.sea_range) && this.mapRangeCheck(y, battle.sea_range))) {
            throw this.errorCodes.err_out_of_range;
        }
        
        if (battle.status < 2) {
            throw this.errorCodes.err_not_start;
        }
        
        if (nickname !== battle.players[battle.turns]) {
            throw this.errorCodes.err_op_turn;
        }
        
        const rival = this.getRival(battle.players, nickname);
        const rivalMap = battle.maps[rival];
        const index = x * battle.sea_range + y;
        
        if (rivalMap[index] > 9) {
            throw this.errorCodes.err_repeat_op;
        }
        
        // 执行攻击
        const isEnd = this.executeAttack(roomId, nickname, x, y);
        
        return {
            game_status: isEnd
        };
    },
    
    // 处理获取胜者请求
    handleGetWinner: function(data) {
        const roomId = parseInt(this.getCookie('room_id'));
        const nickname = this.getCookie('nickname');
        
        const battle = this.battleMap[roomId];
        
        if (battle.status !== 3) {
            throw this.errorCodes.err_not_end;
        }
        
        let mapInfo = null;
        const rival = this.getRival(battle.players, nickname);
        
        if (battle.game_type === 'guess') {
            mapInfo = battle.guess_map[rival];
        } else {
            mapInfo = battle.maps[rival];
        }
        
        if (battle.has_winner >= 0) {
            return {
                has_winner: 1,
                winner: battle.players[battle.has_winner],
                map_info: mapInfo
            };
        } else {
            return {
                has_winner: 0,
                winner: null,
                map_info: mapInfo
            };
        }
    },
    
    // 处理猜测请求
    handleGuess: function(data) {
        const roomId = parseInt(this.getCookie('room_id'));
        const nickname = this.getCookie('nickname');
        let mapInfo = data.map_info;
        
        const battle = this.battleMap[roomId];
        
        // 计算猜测结果
        function calcGuessResult(guessMap, rivalMap) {
            let guessRet = 0;
            const mapLength = rivalMap.length;
            for (let i = 0; i < mapLength; i++) {
                if (guessMap[i] + rivalMap[i] === 2) {
                    guessRet += 1;
                }
            }
            return guessRet;
        }
        
        // 计算猜测胜者
        function calcGuessWinner(guessRet) {
            const a = battle.players[0];
            const b = battle.players[1];
            if (guessRet[a] > guessRet[b]) {
                return 0;
            } else if (guessRet[a] < guessRet[b]) {
                return 1;
            } else {
                return -1;
            }
        }
        
        mapInfo = mapInfo.split('').map((x) => {
            return parseInt(x);
        });
        
        if (!this.checkGuessMap(mapInfo, battle.sea_range)) {
            throw this.errorCodes.err_map_info;
        }
        
        if (!battle.guess_map) {
            battle.guess_map = {};
            battle.guess_cnt = 0;
            battle.guess_ret = {};
        }
        
        if (battle.guess_map[nickname]) {
            throw this.errorCodes.err_repeat_op;
        }
        
        const rival = this.getRival(battle.players, nickname);
        battle.guess_map[nickname] = mapInfo;
        battle.guess_cnt += 1;
        
        // 如果对手还没有猜测，为AI生成猜测
        if (!battle.guess_map[rival] && rival !== Game.nickname) {
            battle.guess_map[rival] = this.generateAIGuessMap(battle.sea_range);
            battle.guess_cnt += 1;
        }
        
        battle.guess_ret[nickname] = calcGuessResult(mapInfo, battle.maps[rival]);
        
        // 如果双方都已猜测，计算结果
        if (battle.guess_cnt === 2) {
            battle.status += 1;
            battle.has_winner = calcGuessWinner(battle.guess_ret);
        }
        
        return {
            rival_map: battle.maps[rival],
            bingo_cnt: battle.guess_ret[nickname]
        };
    },
    
    // 生成GUID
    generateGUID: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

// 页面加载完成后初始化本地服务器
$(document).ready(function() {
    // 初始化本地服务器
    LocalServer.init();
    
    console.log('本地服务器模式已启用，游戏可以完全在前端运行');
});
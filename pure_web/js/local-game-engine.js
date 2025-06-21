/**
 * 本地游戏引擎 - 直接提供游戏逻辑功能
 * 这个文件重构了原本的local-server.js，去除了不必要的web请求模拟，直接提供游戏逻辑函数
 */

// 本地游戏引擎对象
const LocalGameEngine = {
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
    
    // 初始化本地游戏引擎
    init: function() {
        console.log('本地游戏引擎已初始化');
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
        
        // 使用更智能的预判策略
        // 1. 随机选择一些位置
        // 2. 尝试模拟舰船的可能布局
        
        // 随机选择一些位置
        const randomSelections = Math.floor(stepCnt * 0.5); // 一半随机选择
        for (let i = 0; i < randomSelections; i++) {
            const randomIndex = Math.floor(Math.random() * positions.length);
            const position = positions.splice(randomIndex, 1)[0];
            map[position] = 1;
        }
        
        // 模拟舰船布局 - 水平和垂直连续格子
        const shipSizes = Game.shipSizes[seaRange];
        const remainingSelections = stepCnt - randomSelections;
        let selectionsLeft = remainingSelections;
        
        // 尝试放置一些连续的格子模拟舰船
        while (selectionsLeft > 0 && positions.length > 0) {
            // 随机选择方向 (水平或垂直)
            const isHorizontal = Math.random() < 0.5;
            // 随机选择舰船大小 (1-3格)
            const shipSize = Math.min(Math.floor(Math.random() * 3) + 1, selectionsLeft, positions.length);
            
            // 随机选择起始位置
            const startIndex = Math.floor(Math.random() * positions.length);
            const startPosition = positions[startIndex];
            const startX = Math.floor(startPosition / seaRange);
            const startY = startPosition % seaRange;
            
            // 检查是否可以放置连续格子
            let canPlace = true;
            const shipPositions = [];
            
            for (let i = 0; i < shipSize; i++) {
                const x = isHorizontal ? startX : startX + i;
                const y = isHorizontal ? startY + i : startY;
                
                // 检查是否超出边界
                if (x >= seaRange || y >= seaRange) {
                    canPlace = false;
                    break;
                }
                
                const pos = x * seaRange + y;
                // 检查位置是否可用
                if (!positions.includes(pos)) {
                    canPlace = false;
                    break;
                }
                
                shipPositions.push(pos);
            }
            
            // 如果可以放置，则标记这些位置
            if (canPlace) {
                for (const pos of shipPositions) {
                    map[pos] = 1;
                    // 从可用位置中移除
                    const posIndex = positions.indexOf(pos);
                    if (posIndex !== -1) {
                        positions.splice(posIndex, 1);
                    }
                }
                selectionsLeft -= shipSize;
            } else {
                // 如果不能放置，移除起始位置避免重复尝试
                positions.splice(startIndex, 1);
                // 如果没有足够的位置，就退出循环
                if (positions.length < shipSize) {
                    break;
                }
            }
        }
        
        // 如果还有剩余的选择次数，随机填充
        while (selectionsLeft > 0 && positions.length > 0) {
            const randomIndex = Math.floor(Math.random() * positions.length);
            const position = positions.splice(randomIndex, 1)[0];
            map[position] = 1;
            selectionsLeft--;
        }
        
        return map;
    },
    
    // 创建新游戏
    createGame: function(gameType, seaRange) {
        // 生成新的房间ID
        const battleIndex = this.battleMap.currMaxRoomId;
        this.battleMap.currMaxRoomId += 1;
        
        // 将游戏类型转换为数字
        let gameTypeNum = 0; // 默认普通模式
        if (gameType === 'speed') {
            gameTypeNum = 1; // 竞速模式
        } else if (gameType === 'guess') {
            gameTypeNum = 2; // 预判模式
        }
        
        // 创建新的游戏对象
        const battle = {
            game_type: gameTypeNum,
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
            status: 'ok',
            result: {
                room_id: battleIndex
            }
        };
    },
    
    // 加入游戏
    joinGame: function(roomId, nickname) {
        if (!roomId) {
            return {
                status: 'error',
                msg: this.errorCodes.err_no_room.msg
            };
        }
        
        const battle = this.battleMap[roomId];
        if (!battle) {
            return {
                status: 'error',
                msg: this.errorCodes.err_room_not_found.msg
            };
        }
        
        if (battle.players.length === 2) {
            return {
                status: 'error',
                msg: this.errorCodes.err_room_is_full.msg
            };
        }
        
        if (!nickname) {
            nickname = "Visitor" + (battle.players.length);
        }
        
        // 检查昵称是否与AI重复
        if (nickname === 'AI') {
            return {
                status: 'error',
                msg: this.errorCodes.err_repeat_name.msg
            };
        }
        
        battle.players.push(nickname);
        battle.turns = -1;
        battle.status += 1;
        
        // 为AI玩家生成随机地图
        const aiMap = this.generateRandomMap(battle.sea_range);
        battle.maps['AI'] = aiMap;
        battle.map_setted += 1;
        
        console.log('玩家加入游戏，AI地图已生成');

        // 将数字类型的游戏类型转换回字符串类型
        let gameTypeStr = 'normal';
        if (battle.game_type === 1) {
            gameTypeStr = 'speed';
        } else if (battle.game_type === 2) {
            gameTypeStr = 'guess';
        }
        
        return {
            status: 'ok',
            result: {
                password: battle.password,
                sea_range: battle.sea_range,
                game_type: gameTypeStr
            }
        };
    },
    
    // 设置地图
    setMap: function(roomId, nickname, mapInfo) {
        const battle = this.battleMap[roomId];
        
        if (!battle) {
            return {
                status: 'error',
                msg: this.errorCodes.err_room_not_found.msg
            };
        }
        
        // 将字符串转换为数组
        if (typeof mapInfo === 'string') {
            mapInfo = mapInfo.split('').map(x => parseInt(x));
        }
        
        if (!this.checkMap(mapInfo, battle.sea_range)) {
            return {
                status: 'error',
                msg: this.errorCodes.err_map_info.msg
            };
        }
        
        if (battle.maps[nickname]) {
            return {
                status: 'error',
                msg: this.errorCodes.err_map_setted.msg
            };
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
        
        return {
            status: 'ok',
            result: {}
        };
    },
    
    // 获取游戏状态
    getGameStatus: function(roomId) {
        const battle = this.battleMap[roomId];
        
        if (!battle) {
            return {
                status: 'error',
                msg: this.errorCodes.err_room_not_found.msg
            };
        }
        
        return {
            status: 'ok',
            result: {
                status: battle.status
            }
        };
    },
    
    // 获取玩家信息
    getPlayers: function(roomId) {
        const battle = this.battleMap[roomId];
        
        if (!battle) {
            return {
                status: 'error',
                msg: this.errorCodes.err_room_not_found.msg
            };
        }
        
        return {
            status: 'ok',
            result: {
                players: battle.players
            }
        };
    },
    
    // 获取当前操作数
    getCurrentOpCount: function(roomId) {
        const battle = this.battleMap[roomId];
        
        if (!battle) {
            return {
                status: 'error',
                msg: this.errorCodes.err_room_not_found.msg
            };
        }
        
        if (battle.status < 2) {
            return {
                status: 'error',
                msg: this.errorCodes.err_not_start.msg
            };
        }
        
        if (battle.game_type === 'guess') {
            return {
                status: 'error',
                msg: this.errorCodes.err_request.msg
            };
        }
        
        return {
            status: 'ok',
            result: {
                op_cnt: battle.ops.length
            }
        };
    },
    
    // 执行AI操作
    performAIOperation: function(roomId, aiNickname) {
        const battle = this.battleMap[roomId];
        const playerNickname = Game.nickname;
        
        // 如果不是AI回合或游戏已结束，不执行操作
        if (battle.turns !== battle.players.indexOf(aiNickname) || battle.status !== 2) {
            return false;
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
            return false;
        }
        
        // 随机选择一个位置攻击
        const randomIndex = Math.floor(Math.random() * possibleMoves.length);
        const move = possibleMoves[randomIndex];
        
        // 执行攻击
        return this.executeAttack(roomId, aiNickname, move.x, move.y);
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
    
    // 获取操作详情
    getOperation: function(roomId, opCnt) {
        const battle = this.battleMap[roomId];
        
        if (!battle) {
            return {
                status: 'error',
                msg: this.errorCodes.err_room_not_found.msg
            };
        }
        
        if (!opCnt && opCnt !== 0) {
            opCnt = 0;
        } else {
            opCnt = parseInt(opCnt);
        }
        
        const turns = battle.players[battle.turns];
        const isEnd = battle.status === 3;
        
        // 如果是AI的回合，自动进行AI操作
        if (turns !== Game.nickname && battle.status === 2) {
            this.performAIOperation(roomId, turns);
        }
        
        let result;
        if (opCnt > 0) {
            const op = battle.ops[opCnt - 1];
            result = {
                op: op,
                turns: turns,
                is_end: isEnd
            };
        } else {
            result = {
                op: null,
                turns: turns,
                is_end: isEnd
            };
        }
        
        return {
            status: 'ok',
            result: result
        };
    },
    
    // 设置操作
    setOperation: function(roomId, nickname, x, y) {
        const battle = this.battleMap[roomId];
        
        if (!battle) {
            return {
                status: 'error',
                msg: this.errorCodes.err_room_not_found.msg
            };
        }
        
        if (x === undefined || y === undefined) {
            return {
                status: 'error',
                msg: this.errorCodes.err_coordinate.msg
            };
        }
        
        x = parseInt(x);
        y = parseInt(y);
        
        if (!(this.mapRangeCheck(x, battle.sea_range) && this.mapRangeCheck(y, battle.sea_range))) {
            return {
                status: 'error',
                msg: this.errorCodes.err_out_of_range.msg
            };
        }
        
        if (battle.status < 2) {
            return {
                status: 'error',
                msg: this.errorCodes.err_not_start.msg
            };
        }
        
        if (nickname !== battle.players[battle.turns]) {
            return {
                status: 'error',
                msg: this.errorCodes.err_op_turn.msg
            };
        }
        
        const rival = this.getRival(battle.players, nickname);
        const rivalMap = battle.maps[rival];
        const index = x * battle.sea_range + y;
        
        if (rivalMap[index] > 9) {
            return {
                status: 'error',
                msg: this.errorCodes.err_repeat_op.msg
            };
        }
        
        // 执行攻击
        const isEnd = this.executeAttack(roomId, nickname, x, y);
        
        return {
            status: 'ok',
            result: {
                game_status: isEnd
            }
        };
    },
    
    // 获取胜者信息
    getWinner: function(roomId, nickname) {
        const battle = this.battleMap[roomId];
        
        if (!battle) {
            return {
                status: 'error',
                msg: this.errorCodes.err_room_not_found.msg
            };
        }
        
        if (battle.status !== 3) {
            return {
                status: 'error',
                msg: this.errorCodes.err_not_end.msg
            };
        }
        
        const rival = this.getRival(battle.players, nickname);
        let mapInfo = null;
        
        // 在所有模式下，返回对手的实际舰队地图
        mapInfo = battle.maps[rival];
        const playerMap = battle.maps[nickname];
        
        // 在预判模式下，返回AI的预判地图
        let aiGuessMap = null;
        if (battle.game_type === 2 && battle.guess_map && battle.guess_map[rival]) {
            aiGuessMap = battle.guess_map[rival];
        }
        
        let result;
        if (battle.has_winner >= 0) {
            result = {
                has_winner: 1,
                winner: battle.players[battle.has_winner],
                map_info: mapInfo,
                player_map: playerMap,
                ai_guess_map: aiGuessMap
            };
        } else {
            result = {
                has_winner: 0,
                winner: null,
                map_info: mapInfo,
                player_map: playerMap,
                ai_guess_map: aiGuessMap
            };
        }
        
        // 如果是预判模式，添加双方的命中次数
        if (battle.game_type === 2 && battle.guess_ret) {
            result.player_hit_count = battle.guess_ret[nickname] || 0;
            result.rival_hit_count = battle.guess_ret[rival] || 0;
        }
        
        return {
            status: 'ok',
            result: result
        };
    },
    
    // 处理猜测
    makeGuess: function(roomId, nickname, mapInfo) {
        const battle = this.battleMap[roomId];
        
        if (!battle) {
            return {
                status: 'error',
                msg: this.errorCodes.err_room_not_found.msg
            };
        }
        
        // 将字符串转换为数组
        if (typeof mapInfo === 'string') {
            mapInfo = mapInfo.split('').map(x => parseInt(x));
        }
        
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
        
        if (!this.checkGuessMap(mapInfo, battle.sea_range)) {
            return {
                status: 'error',
                msg: this.errorCodes.err_map_info.msg
            };
        }
        
        if (!battle.guess_map) {
            battle.guess_map = {};
            battle.guess_cnt = 0;
            battle.guess_ret = {};
        }
        
        if (battle.guess_map[nickname]) {
            return {
                status: 'error',
                msg: this.errorCodes.err_repeat_op.msg
            };
        }
        
        const rival = this.getRival(battle.players, nickname);
        battle.guess_map[nickname] = mapInfo;
        battle.guess_cnt += 1;
        
        // 如果对手还没有猜测，为AI生成猜测
        if (!battle.guess_map[rival] && rival === 'AI') {
            battle.guess_map[rival] = this.generateAIGuessMap(battle.sea_range);
            battle.guess_cnt += 1;
            // 计算AI的命中次数
            battle.guess_ret[rival] = calcGuessResult(battle.guess_map[rival], battle.maps[nickname]);
        }
        
        battle.guess_ret[nickname] = calcGuessResult(mapInfo, battle.maps[rival]);
        
        // 如果双方都已猜测，计算结果
        if (battle.guess_cnt === 2) {
            battle.status += 1;
            battle.has_winner = calcGuessWinner(battle.guess_ret);
        }
        
        return {
            status: 'ok',
            result: {
                rival_map: battle.maps[rival],
                bingo_cnt: battle.guess_ret[nickname]
            }
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

// 页面加载完成后初始化本地游戏引擎
$(document).ready(function() {
    // 初始化本地游戏引擎
    LocalGameEngine.init();
    
    console.log('本地游戏引擎已启用，游戏可以直接在前端运行，无需模拟网络请求');
});
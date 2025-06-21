// 游戏全局变量
const Game = {
    // 游戏状态
    status: 'idle', // idle, creating, joining, deploying, waiting, battle, ended
    roomId: null,
    nickname: null,
    opponent: null,
    isCreator: false,
    boardSize: 6,
    apiBase: '/api/sea_battle', // 保持原路径，本地服务器会拦截请求
    password: null,
    gameType: 'normal',
    seaRange: 6,
    gameStatus: -2, // -2: 未开始, -1: 等待玩家, 0: 等待玩家, 1: 设置地图, 2: 游戏中, 3: 游戏结束
    players: [],
    turns: '',
    isOurTurn: false,
    currOpCnt: -1,
    ships: [],
    shipOrientation: 'horizontal', // horizontal or vertical
    playerBoard: [],
    enemyBoard: [],
    gameTypeMap: {
        'normal': '普通模式',
        'speed': '竞速模式',
        'guess': '预判模式'
    },
    statusMap: {
        '-2': '未开始',
        '-1': '等待玩家',
        '0': '等待玩家',
        '1': '设置地图',
        '2': '游戏中',
        '3': '游戏结束'
    },
    shipSizes: {
        6: [2, 3],           // 6x6 地图放置 1*2 和 1*3 两艘船
        8: [2, 3, 3, 4]      // 8x8 地图放置 1*2、1*3、1*3 和 1*4 四艘船
    },
    currentShipIndex: 0,
    deployedShips: [],
    apiBaseUrl: '/2.0',      // API 基础路径，本地服务器会拦截请求
};

// DOM 加载完成后初始化游戏
$(document).ready(function() {
    initEventListeners();
});

// 初始化事件监听器
function initEventListeners() {
    // 创建游戏按钮
    $('#create-game').click(createGame);
    
    // 加入游戏按钮
    $('#join-game').click(joinGame);
    
    // 旋转舰船按钮
    $('#rotate-ship').click(toggleShipOrientation);
    
    // 重置部署按钮
    $('#reset-deployment').click(resetDeployment);
    
    // 确认部署按钮
    $('#confirm-deployment').click(confirmDeployment);
    
    // 获取提示按钮
    $('#get-hint').click(getHint);
    
    // 结束游戏按钮
    $('#end-game').click(endGame);
    
    // 返回主页按钮
    $('#back-to-home').click(backToHome);
}

// 创建新游戏
function createGame() {
    const nickname = $('#nickname').val().trim();
    if (!nickname) {
        alert('请输入昵称');
        return;
    }
    
    Game.nickname = nickname;
    Game.gameType = $('#game-type').val();
    Game.seaRange = parseInt($('#sea-range').val());
    
    // 设置 cookie
    document.cookie = `nickname=${Game.nickname}; path=/`;
    
    // 记录游戏开始
    if (typeof StatisticsManager !== 'undefined') {
        StatisticsManager.recordGameStart(Game.gameType, Game.seaRange);
    }
    
    // 调用创建游戏 API
    $.get(`${Game.apiBaseUrl}/new_game`, {
        game_type: Game.gameType,
        sea_range: Game.seaRange
    }, function(response) {
        if (response.status === 'ok') {
            Game.roomId = response.result.room_id;
            document.cookie = `room_id=${Game.roomId}; path=/`;
            
            // 加入刚创建的游戏
            joinCreatedGame();
        } else {
            alert('创建游戏失败: ' + response.msg);
        }
    });
}

// 加入刚创建的游戏
function joinCreatedGame() {
    $.get(`${Game.apiBaseUrl}/join_game`, {
        room_id: Game.roomId,
        nickname: Game.nickname
    }, function(response) {
        if (response.status === 'ok') {
            Game.password = response.result.password;
            Game.seaRange = response.result.sea_range;
            Game.gameType = response.result.game_type;
            
            // 更新游戏信息显示
            updateGameInfo();
            
            // 显示部署界面
            showDeploymentScreen();
        } else {
            alert('加入游戏失败: ' + response.msg);
        }
    });
}

// 加入已有游戏
function joinGame() {
    const nickname = $('#nickname').val().trim();
    const roomId = $('#room-id').val().trim();
    
    if (!nickname) {
        alert('请输入昵称');
        return;
    }
    
    if (!roomId) {
        alert('请输入房间ID');
        return;
    }
    
    Game.nickname = nickname;
    Game.roomId = parseInt(roomId);
    
    // 设置 cookie
    document.cookie = `nickname=${Game.nickname}; path=/`;
    document.cookie = `room_id=${Game.roomId}; path=/`;
    
    // 记录游戏开始
    if (typeof StatisticsManager !== 'undefined') {
        StatisticsManager.recordGameStart(Game.gameType, Game.seaRange);
    }
    
    // 调用加入游戏 API
    $.get(`${Game.apiBaseUrl}/join_game`, {
        room_id: Game.roomId,
        nickname: Game.nickname
    }, function(response) {
        if (response.status === 'ok') {
            Game.password = response.result.password;
            Game.seaRange = response.result.sea_range;
            Game.gameType = response.result.game_type;
            
            // 更新游戏信息显示
            updateGameInfo();
            
            // 显示部署界面
            showDeploymentScreen();
        } else {
            alert('加入游戏失败: ' + response.msg);
        }
    });
}

// 更新游戏信息显示
function updateGameInfo() {
    $('#display-room-id').text(Game.roomId);
    $('#display-game-type').text(Game.gameTypeMap[Game.gameType] || Game.gameType);
    $('#display-sea-range').text(`${Game.seaRange}x${Game.seaRange}`);
    $('#display-game-status').text(Game.statusMap[Game.gameStatus.toString()] || '未知');
    
    // 显示游戏信息区域
    $('#game-setup').addClass('hidden');
    $('#game-info').removeClass('hidden');
    
    // 获取玩家信息
    getPlayers();
    
    // 获取游戏状态
    getGameStatus();
}

// 获取玩家信息
function getPlayers() {
    $.get(`${Game.apiBaseUrl}/get_players`, function(response) {
        if (response.status === 'ok') {
            Game.players = response.result.players;
            let playersText = Game.players.join(', ');
            $('#display-players').text(playersText);
        }
    });
}

// 获取游戏状态
function getGameStatus() {
    $.get(`${Game.apiBaseUrl}/get_status`, function(response) {
        if (response.status === 'ok') {
            Game.gameStatus = response.result.status;
            $('#display-game-status').text(Game.statusMap[Game.gameStatus.toString()] || '未知');
            
            // 根据游戏状态更新界面
            updateGameUI();
        }
    });
}

// 根据游戏状态更新界面
function updateGameUI() {
    if (Game.gameStatus === 1) {
        // 设置地图阶段
        showDeploymentScreen();
    } else if (Game.gameStatus === 2) {
        // 游戏中
        showBattleScreen();
        startGameLoop();
    } else if (Game.gameStatus === 3) {
        // 游戏结束
        showResultScreen();
    } else {
        // 等待玩家
        setTimeout(getGameStatus, 100); // 每100ms检查一次游戏状态
    }
}

// 显示部署界面
function showDeploymentScreen() {
    $('#game-deployment').removeClass('hidden');
    $('#game-battle').addClass('hidden');
    $('#game-result').addClass('hidden');
    
    // 显示加载动画
    if (typeof LoadingManager !== 'undefined') {
        LoadingManager.show('准备部署舰船...');
    }
    
    // 初始化部署棋盘
    initDeploymentBoard();
    
    // 隐藏加载动画
    if (typeof LoadingManager !== 'undefined') {
        LoadingManager.hide();
    }
    
    // 显示部署教程
    setTimeout(function() {
        if (typeof TutorialManager !== 'undefined' && !localStorage.getItem('deployment_tutorial_shown')) {
            // 设置特定的部署教程步骤
            TutorialManager.steps = [
                {
                    title: '部署你的舰队',
                    content: '现在你需要在海域中部署你的舰船。点击左侧的舰船，然后点击棋盘上的格子来放置它。',
                    target: '#deployment-board',
                    position: 'right'
                },
                {
                    title: '旋转舰船',
                    content: '你可以按R键或点击旋转按钮来改变舰船的方向。',
                    target: '#rotate-ship',
                    position: 'bottom'
                },
                {
                    title: '重置部署',
                    content: '如果你不满意当前的部署，可以点击重置按钮重新开始。',
                    target: '#reset-deployment',
                    position: 'bottom'
                },
                {
                    title: '确认部署',
                    content: '当所有舰船都部署完毕后，点击确认按钮开始游戏。',
                    target: '#confirm-deployment',
                    position: 'bottom'
                }
            ];
            
            TutorialManager.show();
            localStorage.setItem('deployment_tutorial_shown', 'true');
        }
    }, 1000);
}

// 初始化部署棋盘
function initDeploymentBoard() {
    // 清空棋盘
    $('#deployment-board').empty();
    
    // 设置棋盘大小类
    $('#deployment-board').addClass(`board size-${Game.seaRange}`);
    
    // 初始化玩家棋盘数组
    Game.playerBoard = Array(Game.seaRange).fill().map(() => Array(Game.seaRange).fill(0));
    
    // 创建棋盘格子
    for (let i = 0; i < Game.seaRange; i++) {
        for (let j = 0; j < Game.seaRange; j++) {
            const cell = $('<div class="cell"></div>');
            cell.attr('data-x', i);
            cell.attr('data-y', j);
            cell.click(function() {
                deployShip(i, j);
            });
            $('#deployment-board').append(cell);
        }
    }
    
    // 初始化舰船
    Game.ships = Game.shipSizes[Game.seaRange];
    Game.currentShipIndex = 0;
    Game.deployedShips = [];
    
    // 更新舰船信息
    updateShipInfo();
}

// 更新舰船信息
function updateShipInfo() {
    if (Game.currentShipIndex < Game.ships.length) {
        const remainingShips = Game.ships.slice(Game.currentShipIndex);
        let shipInfo = '待放置: ';
        remainingShips.forEach((size, index) => {
            shipInfo += `1x${size}${index < remainingShips.length - 1 ? ', ' : ''}`;
        });
        $('#deployment-ships-info').text(shipInfo);
    } else {
        $('#deployment-ships-info').text('所有舰船已放置');
    }
}

// 切换舰船方向
function toggleShipOrientation() {
    Game.shipOrientation = Game.shipOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    $('#rotate-ship').text(Game.shipOrientation === 'horizontal' ? '旋转舰船 (当前: 水平)' : '旋转舰船 (当前: 垂直)');
}

// 部署舰船
function deployShip(x, y) {
    if (Game.currentShipIndex >= Game.ships.length) {
        alert('所有舰船已放置');
        return;
    }
    
    const shipSize = Game.ships[Game.currentShipIndex];
    const isHorizontal = Game.shipOrientation === 'horizontal';
    
    // 检查是否可以放置
    if (!canPlaceShip(x, y, shipSize, isHorizontal)) {
        alert('无法在此位置放置舰船');
        return;
    }
    
    // 放置舰船
    const shipCells = [];
    for (let i = 0; i < shipSize; i++) {
        const cellX = isHorizontal ? x : x + i;
        const cellY = isHorizontal ? y + i : y;
        Game.playerBoard[cellX][cellY] = 1;
        shipCells.push({x: cellX, y: cellY});
        
        // 更新UI
        $(`.cell[data-x="${cellX}"][data-y="${cellY}"]`).addClass('ship');
    }
    
    // 记录已部署的舰船
    const deployedShip = {
        size: shipSize,
        orientation: Game.shipOrientation,
        cells: shipCells
    };
    
    Game.deployedShips.push(deployedShip);
    
    // 记录舰船部署统计
    if (typeof StatisticsManager !== 'undefined') {
        StatisticsManager.recordShipDeployment(deployedShip);
    }
    
    // 移动到下一艘舰船
    Game.currentShipIndex++;
    updateShipInfo();
    
    // 如果所有舰船都已放置，启用确认按钮
    if (Game.currentShipIndex >= Game.ships.length) {
        $('#confirm-deployment').prop('disabled', false);
    }
}

// 检查是否可以放置舰船
function canPlaceShip(x, y, size, isHorizontal) {
    // 检查是否超出边界
    if (isHorizontal) {
        if (y + size > Game.seaRange) return false;
    } else {
        if (x + size > Game.seaRange) return false;
    }
    
    // 检查是否与其他舰船重叠
    for (let i = 0; i < size; i++) {
        const cellX = isHorizontal ? x : x + i;
        const cellY = isHorizontal ? y + i : y;
        if (Game.playerBoard[cellX][cellY] === 1) return false;
    }
    
    return true;
}

// 重置部署
function resetDeployment() {
    initDeploymentBoard();
}

// 确认部署
function confirmDeployment() {
    if (Game.currentShipIndex < Game.ships.length) {
        alert('请放置所有舰船');
        return;
    }
    
    // 将棋盘转换为字符串
    let mapInfo = '';
    for (let i = 0; i < Game.seaRange; i++) {
        for (let j = 0; j < Game.seaRange; j++) {
            mapInfo += Game.playerBoard[i][j];
        }
    }
    
    // 调用设置地图 API
    $.post(`${Game.apiBaseUrl}/set_map`, {
        map_info: mapInfo
    }, function(response) {
        if (response.status === 'ok') {
            // 等待游戏开始
            waitForGameStart();
        } else {
            alert('设置地图失败: ' + response.msg);
        }
    });
}

// 等待游戏开始
function waitForGameStart() {
    $('#deployment-ships-info').text('等待对手部署...');
    $('#rotate-ship, #reset-deployment, #confirm-deployment').prop('disabled', true);
    
    // 定时检查游戏状态
    const statusCheckInterval = setInterval(function() {
        $.get(`${Game.apiBaseUrl}/get_status`, function(response) {
            if (response.status === 'ok') {
                Game.gameStatus = response.result.status;
                $('#display-game-status').text(Game.statusMap[Game.gameStatus.toString()] || '未知');
                
                if (Game.gameStatus === 2) {
                    // 游戏开始
                    clearInterval(statusCheckInterval);
                    showBattleScreen();
                    startGameLoop();
                }
            }
        });
    }, 2000);
}

// 显示战斗界面
function showBattleScreen() {
    $('#game-deployment').addClass('hidden');
    $('#game-battle').removeClass('hidden');
    $('#game-result').addClass('hidden');
    
    // 显示加载动画
    if (typeof LoadingManager !== 'undefined') {
        LoadingManager.show('准备战斗...');
    }
    
    // 初始化战斗棋盘
    initBattleBoards();
    
    // 隐藏加载动画
    if (typeof LoadingManager !== 'undefined') {
        LoadingManager.hide();
    }
    
    // 显示战斗教程
    setTimeout(function() {
        if (typeof TutorialManager !== 'undefined' && !localStorage.getItem('battle_tutorial_shown')) {
            // 设置特定的战斗教程步骤
            TutorialManager.steps = [
                {
                    title: '战斗开始',
                    content: '现在你可以开始攻击敌方舰队。游戏将轮流进行，当轮到你时，你可以选择敌方海域中的一个格子进行攻击。',
                    target: '#battle-screen',
                    position: 'top'
                },
                {
                    title: '攻击敌方',
                    content: '点击敌方海域（上方棋盘）中的格子发动攻击。红色表示命中，白色表示未命中。',
                    target: '#enemy-board',
                    position: 'bottom'
                },
                {
                    title: '查看你的舰队',
                    content: '下方棋盘显示你的舰队。当敌方攻击你的舰队时，被命中的格子会变为红色。',
                    target: '#player-board',
                    position: 'top'
                },
                {
                    title: '回合信息',
                    content: '游戏信息区域会显示当前是谁的回合，以及最近的攻击结果。',
                    target: '#game-info',
                    position: 'right'
                }
            ];
            
            TutorialManager.show();
            localStorage.setItem('battle_tutorial_shown', 'true');
        }
    }, 1000);
}

// 初始化战斗棋盘
function initBattleBoards() {
    // 清空棋盘
    $('#enemy-board, #player-board').empty();
    
    // 设置棋盘大小类
    $('#enemy-board, #player-board').addClass(`board size-${Game.seaRange}`);
    
    // 初始化敌方棋盘数组
    Game.enemyBoard = Array(Game.seaRange).fill().map(() => Array(Game.seaRange).fill(0));
    
    // 创建敌方棋盘格子
    for (let i = 0; i < Game.seaRange; i++) {
        for (let j = 0; j < Game.seaRange; j++) {
            const cell = $('<div class="cell"></div>');
            cell.attr('data-x', i);
            cell.attr('data-y', j);
            cell.click(function() {
                attackEnemy(i, j);
            });
            $('#enemy-board').append(cell);
        }
    }
    
    // 创建玩家棋盘格子
    for (let i = 0; i < Game.seaRange; i++) {
        for (let j = 0; j < Game.seaRange; j++) {
            const cell = $('<div class="cell"></div>');
            cell.attr('data-x', i);
            cell.attr('data-y', j);
            if (Game.playerBoard[i][j] === 1) {
                cell.addClass('ship');
            }
            $('#player-board').append(cell);
        }
    }
}

// 开始游戏循环
function startGameLoop() {
    // 初始化游戏循环变量
    Game.currOpCnt = -1;
    
    // 开始游戏循环
    gameLoop();
}

// 游戏循环
function gameLoop() {
    if (Game.gameStatus !== 2) return;
    
    // 获取当前操作数
    $.get(`${Game.apiBaseUrl}/curr_op_cnt`, function(response) {
        if (response.status === 'ok') {
            const opCnt = response.result.op_cnt;
            
            if (opCnt > Game.currOpCnt) {
                // 有新操作，获取操作详情
                getOperation(opCnt);
            } else {
                // 获取当前回合
                getCurrentTurn();
            }
            
            // 继续游戏循环
            setTimeout(gameLoop, 2000);
        }
    });
}

// 获取操作详情
function getOperation(opCnt) {
    $.get(`${Game.apiBaseUrl}/get_op`, {
        op_cnt: opCnt
    }, function(response) {
        if (response.status === 'ok') {
            Game.currOpCnt = opCnt;
            Game.turns = response.result.turns;
            
            const op = response.result.op;
            if (op) {
                // 更新棋盘
                updateBoardWithOperation(op);
            }
            
            // 检查游戏是否结束
            if (response.result.is_end) {
                Game.gameStatus = 3;
                getGameResult();
            } else {
                // 更新当前回合
                updateTurn();
            }
        }
    });
}

// 获取当前回合
function getCurrentTurn() {
    $.get(`${Game.apiBaseUrl}/get_op`, function(response) {
        if (response.status === 'ok') {
            Game.turns = response.result.turns;
            updateTurn();
        }
    });
}

// 更新当前回合
function updateTurn() {
    Game.isOurTurn = Game.turns === Game.nickname;
    
    if (Game.isOurTurn) {
        $('#display-turn').text('你的回合');
        $('#battle-message').text('轮到你攻击敌方海域');
    } else {
        $('#display-turn').text('对手回合');
        $('#battle-message').text('等待对手攻击');
    }
}

// 更新棋盘显示
function updateBoardWithOperation(op) {
    const x = op.x;
    const y = op.y;
    const bingo = op.bingo;
    const isPlayerOp = op.nickname === Game.nickname;
    
    if (isPlayerOp) {
        // 玩家操作，更新敌方棋盘
        Game.enemyBoard[x][y] = bingo ? 2 : 3; // 2: 击中, 3: 未击中
        const cell = $(`#enemy-board .cell[data-x="${x}"][data-y="${y}"]`);
        cell.addClass(bingo ? 'hit' : 'miss');
        
        $('#battle-message').text(bingo ? '你击中了敌方舰船！' : '你的攻击未命中');
        
        // 记录射击统计
        if (typeof StatisticsManager !== 'undefined') {
            StatisticsManager.recordShot(x, y, bingo);
        }
    } else {
        // 敌方操作，更新玩家棋盘
        const cell = $(`#player-board .cell[data-x="${x}"][data-y="${y}"]`);
        cell.addClass(bingo ? 'hit' : 'miss');
        
        $('#battle-message').text(bingo ? '敌方击中了你的舰船！' : '敌方的攻击未命中');
    }
}

// 攻击敌人
function attackEnemy(x, y) {
    // 检查是否是当前玩家的回合
    if (!Game.isOurTurn) {
        alert('不是你的回合！');
        return;
    }
    
    // 检查是否已经攻击过该位置
    if (Game.enemyBoard[x][y] !== 0) {
        alert('该位置已经攻击过');
        return;
    }
    
    // 发送攻击请求
    $.post(`${Game.apiBaseUrl}/set_op`, {
        x: x,
        y: y
    }, function(response) {
        if (response.status === 'ok') {
            // 操作成功，等待游戏循环更新界面
            Game.isOurTurn = false;
            
            // 检查游戏是否结束
            if (response.result.game_status) {
                Game.gameStatus = 3;
                getGameResult();
            }
        } else {
            alert('攻击失败: ' + response.msg);
        }
    }).fail(function() {
        alert('攻击请求失败，请检查网络连接');
    });
}

// 获取游戏结果
function getGameResult() {
    $.get(`${Game.apiBaseUrl}/get_winner`, function(response) {
        if (response.status === 'ok') {
            const hasWinner = response.result.has_winner;
            const winner = response.result.winner;
            
            let resultMessage = '';
            if (hasWinner) {
                if (winner === Game.nickname) {
                    resultMessage = '恭喜你获胜了！';
                } else {
                    resultMessage = `你输了，${winner} 获胜。`;
                }
            } else {
                resultMessage = '游戏平局。';
            }
            
            // 记录游戏结果统计
            if (typeof StatisticsManager !== 'undefined') {
                StatisticsManager.recordGameEnd(
                    winner === Game.nickname,
                    Game.gameType,
                    Game.seaRange,
                    Game.turns
                );
            }
            
            $('#result-message').text(resultMessage);
            showResultScreen();
        }
    });
}

// 显示结果界面
function showResultScreen() {
    $('#game-deployment').addClass('hidden');
    $('#game-battle').addClass('hidden');
    $('#game-result').removeClass('hidden');
}

// 获取提示
function getHint() {
    alert('提示功能暂未实现');
}

// 结束游戏
function endGame() {
    if (confirm('确定要结束游戏吗？')) {
        backToHome();
    }
}

// 返回主页
function backToHome() {
    // 重置游戏状态
    Game.roomId = null;
    Game.password = null;
    Game.gameStatus = -2;
    Game.players = [];
    Game.turns = '';
    Game.isOurTurn = false;
    Game.currOpCnt = -1;
    
    // 显示主页
    $('#game-setup').removeClass('hidden');
    $('#game-info').addClass('hidden');
    $('#game-deployment').addClass('hidden');
    $('#game-battle').addClass('hidden');
    $('#game-result').addClass('hidden');
}
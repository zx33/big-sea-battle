// 预判模式特定功能

// 预判模式全局变量
const GuessMode = {
    guessMap: [],         // 预判攻击地图
    maxGuessCount: 0,     // 最大预判次数
    currentGuessCount: 0, // 当前已预判次数
    guessSubmitted: false // 是否已提交预判
};

// 初始化预判模式
function initGuessMode() {
    // 根据海域大小设置最大预判次数
    GuessMode.maxGuessCount = Game.seaRange === 6 ? 10 : 20;
    GuessMode.currentGuessCount = 0;
    GuessMode.guessSubmitted = false;
    
    // 初始化预判地图
    GuessMode.guessMap = Array(Game.seaRange * Game.seaRange).fill(0);
    
    // 显示预判模式界面
    showGuessModeUI();
}

// 显示预判模式界面
function showGuessModeUI() {
    // 隐藏普通战斗界面元素
    $('#player-board-wrapper').addClass('hidden');
    $('#get-hint').addClass('hidden');
    
    // 添加预判模式特定元素
    if ($('#guess-info').length === 0) {
        const guessInfo = $(`
            <div id="guess-info" class="guess-mode-info">
                <p>预判模式: 选择 <span id="guess-count">0</span>/${GuessMode.maxGuessCount} 格进行轰炸</p>
                <button id="submit-guess" class="btn primary" disabled>提交预判</button>
            </div>
        `);
        $('#battle-message').after(guessInfo);
        
        // 添加提交预判按钮事件
        $('#submit-guess').click(submitGuess);
    } else {
        $('#guess-info').removeClass('hidden');
        $('#guess-count').text('0');
        $('#submit-guess').prop('disabled', true);
    }
    
    // 更新战斗消息
    $('#battle-message').text('预判模式: 选择格子进行轰炸，一次性选择所有攻击位置');
    
    // 重新绑定敌方棋盘点击事件为预判模式
    $('#enemy-board .cell').off('click').click(function() {
        const x = parseInt($(this).attr('data-x'));
        const y = parseInt($(this).attr('data-y'));
        toggleGuessCell(x, y, this);
    });
}

// 切换预判格子状态
function toggleGuessCell(x, y, cell) {
    if (GuessMode.guessSubmitted) {
        return;
    }
    
    const index = x * Game.seaRange + y;
    const $cell = $(cell);
    
    if (GuessMode.guessMap[index] === 0) {
        // 如果已达到最大预判次数，不允许再选择
        if (GuessMode.currentGuessCount >= GuessMode.maxGuessCount) {
            alert(`最多只能选择 ${GuessMode.maxGuessCount} 格进行轰炸`);
            return;
        }
        
        // 标记为预判
        GuessMode.guessMap[index] = 1;
        GuessMode.currentGuessCount++;
        $cell.addClass('guess');
    } else {
        // 取消预判
        GuessMode.guessMap[index] = 0;
        GuessMode.currentGuessCount--;
        $cell.removeClass('guess');
    }
    
    // 更新预判计数
    $('#guess-count').text(GuessMode.currentGuessCount);
    
    // 更新提交按钮状态
    $('#submit-guess').prop('disabled', GuessMode.currentGuessCount !== GuessMode.maxGuessCount);
}

// 提交预判
function submitGuess() {
    if (GuessMode.currentGuessCount !== GuessMode.maxGuessCount) {
        alert(`请选择 ${GuessMode.maxGuessCount} 格进行轰炸`);
        return;
    }
    
    // 将预判地图转换为字符串
    const mapInfo = GuessMode.guessMap.join('');
    
    // 调用预判 API
    $.post(`${Game.apiBaseUrl}/guess`, {
        map_info: mapInfo
    }, function(response) {
        if (response.status === 'ok') {
            GuessMode.guessSubmitted = true;
            
            // 显示预判结果
            showGuessResult(response.result.rival_map, response.result.bingo_cnt);
            
            // 禁用棋盘点击
            $('#enemy-board .cell').off('click');
            
            // 更新提交按钮
            $('#submit-guess').text('已提交预判').prop('disabled', true);
            
            // 等待对手预判
            waitForOpponentGuess();
        } else {
            alert('提交预判失败: ' + response.msg);
        }
    });
}

// 显示预判结果
function showGuessResult(rivalMap, bingoCount) {
    // 更新战斗消息
    $('#battle-message').text(`你的预判结果: 击中 ${bingoCount} 次`);
    
    // 在棋盘上显示命中情况
    for (let i = 0; i < rivalMap.length; i++) {
        const x = Math.floor(i / Game.seaRange);
        const y = i % Game.seaRange;
        const cell = $(`#enemy-board .cell[data-x="${x}"][data-y="${y}"]`);
        
        if (GuessMode.guessMap[i] === 1) {
            // 如果是我们预判的格子
            if (rivalMap[i] === 1) {
                // 命中
                cell.removeClass('guess').addClass('hit');
            } else {
                // 未命中
                cell.removeClass('guess').addClass('miss');
            }
        }
    }
}

// 等待对手预判
function waitForOpponentGuess() {
    // 定时检查游戏状态
    const statusCheckInterval = setInterval(function() {
        $.get(`${Game.apiBaseUrl}/get_status`, function(response) {
            if (response.status === 'ok') {
                Game.gameStatus = response.result.status;
                $('#display-game-status').text(Game.statusMap[Game.gameStatus.toString()] || '未知');
                
                if (Game.gameStatus === 3) {
                    // 游戏结束
                    clearInterval(statusCheckInterval);
                    getGuessGameResult();
                }
            }
        });
    }, 100);
}

// 获取预判模式游戏结果
function getGuessGameResult() {
    $.get(`${Game.apiBaseUrl}/get_winner`, function(response) {
        if (response.status === 'ok') {
            const hasWinner = response.result.has_winner;
            const winner = response.result.winner;
            const rivalMap = response.result.map_info;
            
            // 计算玩家命中次数
            let playerHitCount = 0;
            for (let i = 0; i < GuessMode.guessMap.length; i++) {
                if (GuessMode.guessMap[i] === 1 && rivalMap[i] === 1) {
                    playerHitCount++;
                }
            }
            
            // 计算预判准确率
            const accuracy = Math.round((playerHitCount / GuessMode.maxGuessCount) * 100);
            
            // 获取对手的命中次数
            let rivalHitCount = response.result.rival_hit_count || 0;
            const rivalAccuracy = Math.round((rivalHitCount / GuessMode.maxGuessCount) * 100);
            
            let resultMessage = '';
            if (hasWinner) {
                if (winner === Game.nickname) {
                    resultMessage = `恭喜你获胜了！你命中 ${playerHitCount} 次，对手命中 ${rivalHitCount} 次`;
                } else {
                    resultMessage = `你输了，${winner} 获胜。你命中 ${playerHitCount} 次，对手命中 ${rivalHitCount} 次`;
                }
            } else {
                resultMessage = `游戏平局。你命中 ${playerHitCount} 次，对手命中 ${rivalHitCount} 次`;
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
            
            // 创建结果界面内容
            const resultContent = $(`
                <div class="guess-result-container">
                    <h2>${resultMessage}</h2>
                    
                    <div class="guess-stats">
                        <div class="stat-box">
                            <h3>战术结果统计</h3>
                            <table class="stats-table">
                                <tr>
                                    <th>玩家</th>
                                    <th>命中次数</th>
                                    <th>准确率</th>
                                </tr>
                                <tr>
                                    <td>你</td>
                                    <td>${playerHitCount}</td>
                                    <td>${accuracy}%</td>
                                </tr>
                                <tr>
                                    <td>对手</td>
                                    <td>${rivalHitCount}</td>
                                    <td>${rivalAccuracy}%</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <div class="guess-comparison">
                        <div class="guess-combined">
                            <h3>预判结果与对手舰队</h3>
                            <div id="combined-board" class="board size-${Game.seaRange}"></div>
                        </div>
                        <div class="guess-ai" id="ai-guess-container">
                            <h3>对手的预判</h3>
                            <div id="ai-guess-board" class="board size-${Game.seaRange}"></div>
                        </div>
                    </div>
                </div>
            `);
            
            // 添加到结果界面
            $('#game-result').html(resultContent);
            
            // 显示合并的预判结果和对手舰队
            for (let i = 0; i < rivalMap.length; i++) {
                const x = Math.floor(i / Game.seaRange);
                const y = i % Game.seaRange;
                const cell = $('<div class="cell"></div>');
                
                // 如果是对手的舰船，添加蓝色背景
                if (rivalMap[i] === 1) {
                    cell.addClass('ship');
                }
                
                // 如果是玩家预判的格子
                if (GuessMode.guessMap[i] === 1) {
                    if (rivalMap[i] === 1) {
                        // 预判正确，添加红色标记
                        cell.addClass('hit');
                    } else {
                        // 预判错误，添加灰色标记
                        cell.addClass('miss');
                    }
                }
                
                $('#combined-board').append(cell);
            }
            
            // 获取并显示AI的预判
            const playerMap = response.result.player_map; // 玩家的实际舰队地图
            const aiGuessMap = response.result.ai_guess_map; // AI的预判地图
            
            // 显示AI的预判
            if (aiGuessMap && playerMap) {
                for (let i = 0; i < aiGuessMap.length; i++) {
                    const x = Math.floor(i / Game.seaRange);
                    const y = i % Game.seaRange;
                    const cell = $('<div class="cell"></div>');
                    
                    // 如果是玩家的舰船，添加蓝色背景
                    if (playerMap[i] === 1) {
                        cell.addClass('ship');
                    }
                    
                    // 如果是AI预判的格子
                    if (aiGuessMap[i] === 1) {
                        if (playerMap[i] === 1) {
                            // 预判正确，添加红色标记
                            cell.addClass('hit');
                        } else {
                            // 预判错误，添加灰色标记
                            cell.addClass('miss');
                        }
                    }
                    
                    $('#ai-guess-board').append(cell);
                }
            } else {
                // 如果没有AI预判数据，隐藏AI预判区域
                $('#ai-guess-container').hide();
            }
            
            // 添加返回主页按钮
            const backButton = $('<button class="btn primary">返回主页</button>');
            backButton.click(function() {
                backToHome();
            });
            
            $('#game-result').append(backButton);
            
            // 显示结果界面
            showResultScreen();
        }
    });
}

// 在游戏开始时检查是否为预判模式
$(document).ready(function() {
    // 添加预判模式的CSS
    $('<style>\n' +
      '.guess { background-color: #FFD700; }\n' +
      '.guess-mode-info { margin: 15px 0; text-align: center; }\n' +
      '.guess-mode-info p { font-size: 1.1rem; margin-bottom: 10px; }\n' +
      '.guess-result-container { text-align: center; padding: 20px; }\n' +
      '.guess-comparison { display: flex; justify-content: center; gap: 30px; margin: 20px 0; flex-wrap: wrap; }\n' +
      '.guess-combined, .guess-ai { flex: 1; min-width: 300px; max-width: 400px; }\n' +
      '.guess-stats { margin: 20px auto; max-width: 500px; }\n' +
      '.stat-box { background-color: #f5f5f5; border-radius: 8px; padding: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }\n' +
      '.stats-table { width: 100%; border-collapse: collapse; margin-top: 10px; }\n' +
      '.stats-table th, .stats-table td { padding: 8px 12px; text-align: center; border-bottom: 1px solid #ddd; }\n' +
      '.stats-table th { background-color: #e0e0e0; font-weight: bold; }\n' +
      '</style>').appendTo('head');
    
    // 监听游戏类型变化
    $('#game-type').change(function() {
        const gameType = $(this).val();
        if (gameType === 'guess') {
            alert('预判模式: 双方放置自己的战舰后，一次性选择格子进行轰炸，击中对手次数多者获胜。');
        }
    });
});

// 修改原始游戏逻辑，支持预判模式
const originalShowBattleScreen = showBattleScreen;
showBattleScreen = function() {
    originalShowBattleScreen();
    
    // 如果是预判模式，初始化预判模式界面
    if (Game.gameType === 'guess') {
        initGuessMode();
    }
};
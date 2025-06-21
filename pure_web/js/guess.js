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
                    getGameResult();
                }
            }
        });
    }, 2000);
}

// 在游戏开始时检查是否为预判模式
$(document).ready(function() {
    // 添加预判模式的CSS
    $('<style>\n' +
      '.guess { background-color: #FFD700; }\n' +
      '.guess-mode-info { margin: 15px 0; text-align: center; }\n' +
      '.guess-mode-info p { font-size: 1.1rem; margin-bottom: 10px; }\n' +
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
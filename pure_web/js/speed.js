// 竞速模式特定功能

// 竞速模式全局变量
const SpeedMode = {
    startTime: 0,        // 游戏开始时间
    elapsedTime: 0,      // 已用时间
    timerInterval: null, // 计时器
    isTimerRunning: false // 计时器是否运行中
};

// 初始化竞速模式
function initSpeedMode() {
    // 显示竞速模式界面
    showSpeedModeUI();
    
    // 监听游戏状态变化，等待游戏开始
    waitForSpeedGameStart();
}

// 显示竞速模式界面
function showSpeedModeUI() {
    // 添加竞速模式特定元素
    if ($('#speed-timer').length === 0) {
        const speedTimer = $(`
            <div id="speed-timer" class="speed-mode-info">
                <p>竞速模式: <span id="timer-display">00:00:00</span></p>
            </div>
        `);
        $('#battle-message').after(speedTimer);
    } else {
        $('#speed-timer').removeClass('hidden');
        $('#timer-display').text('00:00:00');
    }
    
    // 更新战斗消息
    $('#battle-message').text('竞速模式: 尽快击沉对方所有战舰');
}

// 等待竞速游戏开始
function waitForSpeedGameStart() {
    // 定时检查游戏状态
    const statusCheckInterval = setInterval(function() {
        $.get(`${Game.apiBaseUrl}/get_status`, function(response) {
            if (response.status === 'ok') {
                Game.gameStatus = response.result.status;
                $('#display-game-status').text(Game.statusMap[Game.gameStatus.toString()] || '未知');
                
                // 如果游戏状态为进行中，且计时器未启动，则启动计时器
                if (Game.gameStatus === 2 && !SpeedMode.isTimerRunning) {
                    clearInterval(statusCheckInterval);
                    startSpeedTimer();
                }
                
                // 如果游戏结束，停止计时器
                if (Game.gameStatus === 3) {
                    clearInterval(statusCheckInterval);
                    stopSpeedTimer();
                    getGameResult();
                }
            }
        });
    }, 2000);
}

// 启动竞速模式计时器
function startSpeedTimer() {
    SpeedMode.startTime = Date.now();
    SpeedMode.isTimerRunning = true;
    
    // 更新战斗消息
    $('#battle-message').text('竞速模式: 游戏开始！尽快击沉对方所有战舰');
    
    // 启动计时器，每秒更新一次
    SpeedMode.timerInterval = setInterval(function() {
        SpeedMode.elapsedTime = Date.now() - SpeedMode.startTime;
        updateTimerDisplay();
    }, 1000);
    
    // 立即更新一次显示
    updateTimerDisplay();
}

// 停止竞速模式计时器
function stopSpeedTimer() {
    if (SpeedMode.timerInterval) {
        clearInterval(SpeedMode.timerInterval);
        SpeedMode.isTimerRunning = false;
    }
}

// 更新计时器显示
function updateTimerDisplay() {
    const totalSeconds = Math.floor(SpeedMode.elapsedTime / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // 格式化为 HH:MM:SS
    const timeString = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    ].join(':');
    
    $('#timer-display').text(timeString);
}

// 修改游戏结果处理，支持竞速模式
const originalHandleGameResult = handleGameResult;
handleGameResult = function(winner) {
    // 如果是竞速模式，停止计时器
    if (Game.gameType === 'speed') {
        stopSpeedTimer();
    }
    
    // 调用原始处理函数
    originalHandleGameResult(winner);
    
    // 如果是竞速模式，添加用时信息
    if (Game.gameType === 'speed' && winner) {
        // 格式化时间
        const totalSeconds = Math.floor(SpeedMode.elapsedTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const timeString = `${minutes}分${seconds}秒`;
        
        // 添加用时信息到结果消息
        const resultMessage = $('#result-message').text();
        $('#result-message').text(`${resultMessage} 用时: ${timeString}`);
    }
};

// 在游戏开始时检查是否为竞速模式
$(document).ready(function() {
    // 添加竞速模式的CSS
    $('<style>\n' +
      '.speed-mode-info { margin: 15px 0; text-align: center; }\n' +
      '.speed-mode-info p { font-size: 1.1rem; margin-bottom: 10px; }\n' +
      '#timer-display { font-weight: bold; font-family: monospace; font-size: 1.2rem; }\n' +
      '</style>').appendTo('head');
    
    // 监听游戏类型变化
    $('#game-type').change(function() {
        const gameType = $(this).val();
        if (gameType === 'speed') {
            alert('竞速模式: 双方轮流攻击，谁先击沉对方所有战舰谁获胜。');
        }
    });
});

// 修改原始游戏逻辑，支持竞速模式
const originalShowBattleScreen = showBattleScreen;
showBattleScreen = function() {
    originalShowBattleScreen();
    
    // 如果是竞速模式，初始化竞速模式界面
    if (Game.gameType === 'speed') {
        initSpeedMode();
    }
};
/**
 * 游戏统计和分析
 * 用于记录和展示玩家的游戏表现和战绩
 */

// 统计管理器
const StatisticsManager = {
    // 统计数据
    stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        totalShots: 0,
        hitsCount: 0,
        missesCount: 0,
        totalPlayTime: 0,
        gameHistory: [],
        shipDeploymentHeatmap: {},
        shotHeatmap: {}
    },
    
    // 当前游戏开始时间
    gameStartTime: 0,
    
    // 初始化统计管理器
    init: function() {
        // 从本地存储加载统计数据
        this.loadStats();
        
        // 添加统计按钮
        this.addStatsButton();
    },
    
    // 从本地存储加载统计数据
    loadStats: function() {
        const savedStats = localStorage.getItem('sea_battle_stats');
        
        if (savedStats) {
            try {
                this.stats = JSON.parse(savedStats);
            } catch (e) {
                console.error('加载统计数据失败:', e);
            }
        }
    },
    
    // 保存统计数据到本地存储
    saveStats: function() {
        try {
            localStorage.setItem('sea_battle_stats', JSON.stringify(this.stats));
        } catch (e) {
            console.error('保存统计数据失败:', e);
        }
    },
    
    // 记录游戏开始
    recordGameStart: function(gameType, boardSize) {
        this.gameStartTime = Date.now();
        
        // 初始化热图数据
        this.initHeatmaps(boardSize);
    },
    
    // 初始化热图数据
    initHeatmaps: function(boardSize) {
        // 初始化部署热图
        this.stats.shipDeploymentHeatmap = {};
        
        // 初始化射击热图
        this.stats.shotHeatmap = {};
        
        // 根据棋盘大小初始化热图数据
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                const key = `${i},${j}`;
                this.stats.shipDeploymentHeatmap[key] = this.stats.shipDeploymentHeatmap[key] || 0;
                this.stats.shotHeatmap[key] = this.stats.shotHeatmap[key] || 0;
            }
        }
    },
    
    // 记录舰船部署
    recordShipDeployment: function(ship) {
        // 记录舰船占据的每个格子
        for (let i = 0; i < ship.length; i++) {
            let row = ship.row;
            let col = ship.col;
            
            if (ship.direction === 'horizontal') {
                col += i;
            } else {
                row += i;
            }
            
            const key = `${row},${col}`;
            this.stats.shipDeploymentHeatmap[key] = (this.stats.shipDeploymentHeatmap[key] || 0) + 1;
        }
    },
    
    // 记录射击
    recordShot: function(row, col, isHit) {
        // 增加总射击次数
        this.stats.totalShots++;
        
        // 增加命中或未命中次数
        if (isHit) {
            this.stats.hitsCount++;
        } else {
            this.stats.missesCount++;
        }
        
        // 更新射击热图
        const key = `${row},${col}`;
        this.stats.shotHeatmap[key] = (this.stats.shotHeatmap[key] || 0) + 1;
    },
    
    // 记录游戏结束
    recordGameEnd: function(isWinner, gameType, boardSize, turns) {
        // 增加游戏次数
        this.stats.gamesPlayed++;
        
        // 增加胜利或失败次数
        if (isWinner) {
            this.stats.gamesWon++;
        } else {
            this.stats.gamesLost++;
        }
        
        // 计算游戏时长
        const gameEndTime = Date.now();
        const gameDuration = Math.floor((gameEndTime - this.gameStartTime) / 1000); // 秒
        
        // 增加总游戏时长
        this.stats.totalPlayTime += gameDuration;
        
        // 添加游戏历史记录
        this.stats.gameHistory.push({
            date: new Date().toISOString(),
            gameType: gameType,
            boardSize: boardSize,
            result: isWinner ? 'win' : 'loss',
            duration: gameDuration,
            turns: turns
        });
        
        // 限制历史记录数量
        if (this.stats.gameHistory.length > 50) {
            this.stats.gameHistory = this.stats.gameHistory.slice(-50);
        }
        
        // 保存统计数据
        this.saveStats();
    },
    
    // 添加统计按钮
    addStatsButton: function() {
        // 如果已经存在统计按钮，则返回
        if ($('#stats-button').length > 0) {
            return;
        }
        
        // 创建统计按钮
        const statsButton = $(`
            <button id="stats-button" style="
                position: fixed;
                top: 10px;
                right: 60px;
                background-color: #6f42c1;
                color: white;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                font-size: 20px;
                line-height: 40px;
                text-align: center;
                cursor: pointer;
                z-index: 9994;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            ">📊</button>
        `);
        
        // 添加到页面
        $('body').append(statsButton);
        
        // 添加点击事件
        $('#stats-button').click(() => {
            this.showStatsPanel();
        });
    },
    
    // 显示统计面板
    showStatsPanel: function() {
        // 如果已经存在统计面板，则返回
        if ($('#stats-panel').length > 0) {
            $('#stats-panel').show();
            return;
        }
        
        // 计算胜率
        const winRate = this.stats.gamesPlayed > 0 ? (this.stats.gamesWon / this.stats.gamesPlayed * 100).toFixed(1) : 0;
        
        // 计算命中率
        const hitRate = this.stats.totalShots > 0 ? (this.stats.hitsCount / this.stats.totalShots * 100).toFixed(1) : 0;
        
        // 计算平均游戏时长
        const avgGameTime = this.stats.gamesPlayed > 0 ? Math.floor(this.stats.totalPlayTime / this.stats.gamesPlayed) : 0;
        
        // 创建统计面板
        const statsPanel = $(`
            <div id="stats-panel" style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: white;
                border-radius: 10px;
                padding: 20px;
                width: 80%;
                max-width: 800px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                z-index: 9993;
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                ">
                    <h2 style="margin: 0;">游戏统计</h2>
                    <button id="close-stats" style="
                        background: none;
                        border: none;
                        font-size: 24px;
                        cursor: pointer;
                    ">×</button>
                </div>
                
                <div style="
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    margin-bottom: 20px;
                ">
                    <div class="stat-card" style="
                        background-color: #f8f9fa;
                        border-radius: 10px;
                        padding: 15px;
                        width: calc(25% - 15px);
                        margin-bottom: 15px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    ">
                        <h3 style="margin-top: 0;">游戏次数</h3>
                        <p style="
                            font-size: 24px;
                            font-weight: bold;
                            margin: 0;
                        ">${this.stats.gamesPlayed}</p>
                    </div>
                    
                    <div class="stat-card" style="
                        background-color: #f8f9fa;
                        border-radius: 10px;
                        padding: 15px;
                        width: calc(25% - 15px);
                        margin-bottom: 15px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    ">
                        <h3 style="margin-top: 0;">胜率</h3>
                        <p style="
                            font-size: 24px;
                            font-weight: bold;
                            margin: 0;
                            color: ${winRate >= 50 ? '#28a745' : '#dc3545'};
                        ">${winRate}%</p>
                    </div>
                    
                    <div class="stat-card" style="
                        background-color: #f8f9fa;
                        border-radius: 10px;
                        padding: 15px;
                        width: calc(25% - 15px);
                        margin-bottom: 15px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    ">
                        <h3 style="margin-top: 0;">命中率</h3>
                        <p style="
                            font-size: 24px;
                            font-weight: bold;
                            margin: 0;
                            color: ${hitRate >= 40 ? '#28a745' : '#dc3545'};
                        ">${hitRate}%</p>
                    </div>
                    
                    <div class="stat-card" style="
                        background-color: #f8f9fa;
                        border-radius: 10px;
                        padding: 15px;
                        width: calc(25% - 15px);
                        margin-bottom: 15px;
                        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    ">
                        <h3 style="margin-top: 0;">平均时长</h3>
                        <p style="
                            font-size: 24px;
                            font-weight: bold;
                            margin: 0;
                        ">${this.formatTime(avgGameTime)}</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3>游戏历史</h3>
                    <div style="
                        max-height: 200px;
                        overflow-y: auto;
                        border: 1px solid #dee2e6;
                        border-radius: 5px;
                    ">
                        <table style="
                            width: 100%;
                            border-collapse: collapse;
                        ">
                            <thead>
                                <tr style="
                                    background-color: #f8f9fa;
                                    position: sticky;
                                    top: 0;
                                ">
                                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6;">日期</th>
                                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6;">游戏模式</th>
                                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6;">棋盘大小</th>
                                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6;">结果</th>
                                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6;">时长</th>
                                    <th style="padding: 10px; text-align: left; border-bottom: 1px solid #dee2e6;">回合数</th>
                                </tr>
                            </thead>
                            <tbody id="game-history-table">
                                ${this.generateGameHistoryRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3>数据分析</h3>
                    <div style="
                        display: flex;
                        flex-wrap: wrap;
                        justify-content: space-between;
                    ">
                        <div style="width: 48%;">
                            <h4>游戏模式分布</h4>
                            <div id="game-type-chart" style="
                                height: 200px;
                                background-color: #f8f9fa;
                                border-radius: 5px;
                                padding: 10px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">
                                <p>暂无数据</p>
                            </div>
                        </div>
                        
                        <div style="width: 48%;">
                            <h4>胜负分布</h4>
                            <div id="win-loss-chart" style="
                                height: 200px;
                                background-color: #f8f9fa;
                                border-radius: 5px;
                                padding: 10px;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                            ">
                                <div style="
                                    width: 100%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                ">
                                    <div style="
                                        width: ${winRate}%;
                                        height: 30px;
                                        background-color: #28a745;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        color: white;
                                        font-weight: bold;
                                    ">
                                        ${this.stats.gamesWon} 胜
                                    </div>
                                    <div style="
                                        width: ${100 - winRate}%;
                                        height: 30px;
                                        background-color: #dc3545;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        color: white;
                                        font-weight: bold;
                                    ">
                                        ${this.stats.gamesLost} 负
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <button id="reset-stats" style="
                        background-color: #dc3545;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        padding: 8px 15px;
                        cursor: pointer;
                    ">重置统计数据</button>
                </div>
            </div>
        `);
        
        // 添加到页面
        $('body').append(statsPanel);
        
        // 添加关闭按钮事件
        $('#close-stats').click(() => {
            $('#stats-panel').hide();
        });
        
        // 添加重置按钮事件
        $('#reset-stats').click(() => {
            if (confirm('确定要重置所有统计数据吗？此操作不可撤销。')) {
                this.resetStats();
                $('#stats-panel').remove();
                this.showStatsPanel();
            }
        });
    },
    
    // 生成游戏历史表格行
    generateGameHistoryRows: function() {
        if (this.stats.gameHistory.length === 0) {
            return '<tr><td colspan="6" style="padding: 10px; text-align: center;">暂无游戏记录</td></tr>';
        }
        
        let rows = '';
        
        // 倒序显示游戏历史，最新的在最上面
        for (let i = this.stats.gameHistory.length - 1; i >= 0; i--) {
            const game = this.stats.gameHistory[i];
            const date = new Date(game.date).toLocaleString();
            const gameType = this.getGameTypeName(game.gameType);
            const result = game.result === 'win' ? '胜利' : '失败';
            const resultColor = game.result === 'win' ? '#28a745' : '#dc3545';
            
            rows += `
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${date}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${gameType}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${game.boardSize}×${game.boardSize}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #dee2e6; color: ${resultColor};">${result}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${this.formatTime(game.duration)}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #dee2e6;">${game.turns || '-'}</td>
                </tr>
            `;
        }
        
        return rows;
    },
    
    // 获取游戏类型名称
    getGameTypeName: function(gameType) {
        switch (gameType) {
            case 'normal':
                return '普通模式';
            case 'speed':
                return '竞速模式';
            case 'guess':
                return '预判模式';
            default:
                return gameType;
        }
    },
    
    // 格式化时间
    formatTime: function(seconds) {
        if (seconds < 60) {
            return `${seconds}秒`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}分${remainingSeconds}秒`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            return `${hours}小时${minutes}分`;
        }
    },
    
    // 重置统计数据
    resetStats: function() {
        this.stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            gamesLost: 0,
            totalShots: 0,
            hitsCount: 0,
            missesCount: 0,
            totalPlayTime: 0,
            gameHistory: [],
            shipDeploymentHeatmap: {},
            shotHeatmap: {}
        };
        
        this.saveStats();
    }
};

// 在页面加载完成后初始化
$(document).ready(function() {
    // 初始化统计管理器
    StatisticsManager.init();
});

// 导出统计管理器
window.StatisticsManager = StatisticsManager;
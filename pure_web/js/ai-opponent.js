/**
 * AI对手模块 - 提供智能AI对手功能
 * 这个模块扩展了local-server.js中的基本AI功能，提供更智能的游戏策略
 */

// AI对手对象
const AIOpponent = {
    // AI难度级别
    difficultyLevels: {
        EASY: 'easy',       // 完全随机攻击
        MEDIUM: 'medium',   // 有一定策略，击中后会攻击周围
        HARD: 'hard'        // 使用概率热图和追踪算法
    },
    
    // 当前难度级别
    currentDifficulty: 'medium',
    
    // 初始化AI对手
    init: function() {
        console.log('AI对手已初始化，难度级别：' + this.currentDifficulty);
        
        // 从本地存储加载难度设置
        const savedDifficulty = localStorage.getItem('ai_difficulty');
        if (savedDifficulty) {
            this.currentDifficulty = savedDifficulty;
        }
        
        // 添加难度选择UI
        this.addDifficultySelector();
    },
    
    // 添加难度选择UI
    addDifficultySelector: function() {
        // 检查是否已存在
        if ($('#ai-difficulty-selector').length > 0) {
            return;
        }
        
        // 创建难度选择器
        const difficultySelector = $(`
            <div id="ai-difficulty-selector" class="option">
                <label for="ai-difficulty">AI难度：</label>
                <select id="ai-difficulty">
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                </select>
            </div>
        `);
        
        // 添加到游戏设置区域
        $('.setup-options').append(difficultySelector);
        
        // 设置当前选中的难度
        $('#ai-difficulty').val(this.currentDifficulty);
        
        // 添加难度变更事件
        $('#ai-difficulty').change(() => {
            this.currentDifficulty = $('#ai-difficulty').val();
            localStorage.setItem('ai_difficulty', this.currentDifficulty);
            console.log('AI难度已更改为：' + this.currentDifficulty);
        });
    },
    
    // 生成AI的攻击坐标
    generateAttack: function(playerMap, previousAttacks, seaRange) {
        // 根据难度选择不同的攻击策略
        switch (this.currentDifficulty) {
            case this.difficultyLevels.EASY:
                return this.generateRandomAttack(playerMap, seaRange);
            case this.difficultyLevels.MEDIUM:
                return this.generateMediumAttack(playerMap, previousAttacks, seaRange);
            case this.difficultyLevels.HARD:
                return this.generateHardAttack(playerMap, previousAttacks, seaRange);
            default:
                return this.generateRandomAttack(playerMap, seaRange);
        }
    },
    
    // 简单难度：完全随机攻击
    generateRandomAttack: function(playerMap, seaRange) {
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
        
        // 如果没有可能的移动，返回null
        if (possibleMoves.length === 0) {
            return null;
        }
        
        // 随机选择一个位置攻击
        const randomIndex = Math.floor(Math.random() * possibleMoves.length);
        return possibleMoves[randomIndex];
    },
    
    // 中等难度：击中后攻击周围
    generateMediumAttack: function(playerMap, previousAttacks, seaRange) {
        // 查找之前的命中
        const hits = [];
        for (let i = 0; i < previousAttacks.length; i++) {
            const attack = previousAttacks[i];
            if (attack.bingo === 1) { // 命中
                hits.push(attack);
            }
        }
        
        // 如果有命中，尝试攻击周围
        if (hits.length > 0) {
            // 随机选择一个命中点
            const hit = hits[Math.floor(Math.random() * hits.length)];
            
            // 获取周围可攻击的位置
            const adjacentMoves = this.getAdjacentMoves(hit.x, hit.y, playerMap, seaRange);
            
            // 如果周围有可攻击位置，随机选择一个
            if (adjacentMoves.length > 0) {
                return adjacentMoves[Math.floor(Math.random() * adjacentMoves.length)];
            }
        }
        
        // 如果没有命中或周围没有可攻击位置，随机攻击
        return this.generateRandomAttack(playerMap, seaRange);
    },
    
    // 困难难度：使用概率热图和追踪算法
    generateHardAttack: function(playerMap, previousAttacks, seaRange) {
        // 创建概率热图
        const heatmap = this.createHeatmap(playerMap, previousAttacks, seaRange);
        
        // 查找最高概率的位置
        let maxProbability = -1;
        let bestMoves = [];
        
        for (let i = 0; i < seaRange; i++) {
            for (let j = 0; j < seaRange; j++) {
                const index = i * seaRange + j;
                // 只考虑未攻击过的位置
                if (playerMap[index] < 10) {
                    const probability = heatmap[index];
                    
                    if (probability > maxProbability) {
                        maxProbability = probability;
                        bestMoves = [{ x: i, y: j, index: index }];
                    } else if (probability === maxProbability) {
                        bestMoves.push({ x: i, y: j, index: index });
                    }
                }
            }
        }
        
        // 如果有最佳移动，随机选择一个
        if (bestMoves.length > 0) {
            return bestMoves[Math.floor(Math.random() * bestMoves.length)];
        }
        
        // 如果没有可能的移动，随机攻击
        return this.generateRandomAttack(playerMap, seaRange);
    },
    
    // 获取相邻的可攻击位置
    getAdjacentMoves: function(x, y, playerMap, seaRange) {
        const adjacentMoves = [];
        const directions = [
            { dx: -1, dy: 0 }, // 上
            { dx: 1, dy: 0 },  // 下
            { dx: 0, dy: -1 }, // 左
            { dx: 0, dy: 1 }   // 右
        ];
        
        for (let i = 0; i < directions.length; i++) {
            const newX = x + directions[i].dx;
            const newY = y + directions[i].dy;
            
            // 检查是否在范围内
            if (newX >= 0 && newX < seaRange && newY >= 0 && newY < seaRange) {
                const index = newX * seaRange + newY;
                
                // 检查是否已攻击过
                if (playerMap[index] < 10) {
                    adjacentMoves.push({ x: newX, y: newY, index: index });
                }
            }
        }
        
        return adjacentMoves;
    },
    
    // 创建概率热图
    createHeatmap: function(playerMap, previousAttacks, seaRange) {
        // 初始化热图
        const heatmap = Array(seaRange * seaRange).fill(1);
        
        // 标记已攻击的位置
        for (let i = 0; i < seaRange; i++) {
            for (let j = 0; j < seaRange; j++) {
                const index = i * seaRange + j;
                if (playerMap[index] >= 10) {
                    heatmap[index] = 0; // 已攻击过的位置概率为0
                }
            }
        }
        
        // 查找命中
        const hits = [];
        for (let i = 0; i < previousAttacks.length; i++) {
            const attack = previousAttacks[i];
            if (attack.bingo === 1) { // 命中
                hits.push(attack);
            }
        }
        
        // 如果有命中，增加周围位置的概率
        if (hits.length > 0) {
            // 查找连续命中
            const shipDirections = this.findShipDirections(hits, seaRange);
            
            // 如果找到可能的舰船方向，增加该方向的概率
            if (shipDirections.length > 0) {
                for (let i = 0; i < shipDirections.length; i++) {
                    const direction = shipDirections[i];
                    const newX = direction.x;
                    const newY = direction.y;
                    
                    if (newX >= 0 && newX < seaRange && newY >= 0 && newY < seaRange) {
                        const index = newX * seaRange + newY;
                        if (playerMap[index] < 10) {
                            heatmap[index] += 5; // 舰船可能延伸的方向概率更高
                        }
                    }
                }
            } else {
                // 如果没有找到舰船方向，增加所有命中周围的概率
                for (let i = 0; i < hits.length; i++) {
                    const hit = hits[i];
                    const adjacentPositions = this.getAdjacentMoves(hit.x, hit.y, playerMap, seaRange);
                    
                    for (let j = 0; j < adjacentPositions.length; j++) {
                        const pos = adjacentPositions[j];
                        heatmap[pos.index] += 3; // 命中周围的位置概率更高
                    }
                }
            }
        }
        
        // 棋盘模式：增加棋盘格模式的概率
        for (let i = 0; i < seaRange; i++) {
            for (let j = 0; j < seaRange; j++) {
                if ((i + j) % 2 === 0) {
                    const index = i * seaRange + j;
                    if (playerMap[index] < 10) {
                        heatmap[index] += 1; // 棋盘格模式概率略高
                    }
                }
            }
        }
        
        return heatmap;
    },
    
    // 查找可能的舰船方向
    findShipDirections: function(hits, seaRange) {
        const directions = [];
        
        // 如果只有一个命中，返回空
        if (hits.length <= 1) {
            return directions;
        }
        
        // 按x坐标排序
        const sortedByX = [...hits].sort((a, b) => a.x - b.x);
        
        // 按y坐标排序
        const sortedByY = [...hits].sort((a, b) => a.y - b.y);
        
        // 检查水平方向
        let isHorizontal = true;
        const y = sortedByX[0].y;
        for (let i = 1; i < sortedByX.length; i++) {
            if (sortedByX[i].y !== y || sortedByX[i].x !== sortedByX[i-1].x + 1) {
                isHorizontal = false;
                break;
            }
        }
        
        // 检查垂直方向
        let isVertical = true;
        const x = sortedByY[0].x;
        for (let i = 1; i < sortedByY.length; i++) {
            if (sortedByY[i].x !== x || sortedByY[i].y !== sortedByY[i-1].y + 1) {
                isVertical = false;
                break;
            }
        }
        
        // 添加可能的方向
        if (isHorizontal) {
            // 左侧
            if (sortedByX[0].y > 0) {
                directions.push({ x: sortedByX[0].x, y: sortedByX[0].y - 1 });
            }
            // 右侧
            if (sortedByX[sortedByX.length - 1].y < seaRange - 1) {
                directions.push({ x: sortedByX[sortedByX.length - 1].x, y: sortedByX[sortedByX.length - 1].y + 1 });
            }
        }
        
        if (isVertical) {
            // 上方
            if (sortedByY[0].x > 0) {
                directions.push({ x: sortedByY[0].x - 1, y: sortedByY[0].y });
            }
            // 下方
            if (sortedByY[sortedByY.length - 1].x < seaRange - 1) {
                directions.push({ x: sortedByY[sortedByY.length - 1].x + 1, y: sortedByY[sortedByY.length - 1].y });
            }
        }
        
        return directions;
    },
    
    // 生成智能的随机舰船部署
    generateSmartShipDeployment: function(seaRange) {
        const map = Array(seaRange * seaRange).fill(0);
        const shipSizes = Game.shipSizes[seaRange];
        
        // 随机放置每艘舰船，但使用更智能的策略
        for (let i = 0; i < shipSizes.length; i++) {
            const shipSize = shipSizes[i];
            let placed = false;
            let attempts = 0;
            const maxAttempts = 100; // 防止无限循环
            
            // 尝试放置直到成功
            while (!placed && attempts < maxAttempts) {
                attempts++;
                
                // 随机选择方向 (0: 水平, 1: 垂直)
                const isHorizontal = Math.random() < 0.5;
                
                // 随机选择起始位置
                const maxX = isHorizontal ? seaRange : seaRange - shipSize;
                const maxY = isHorizontal ? seaRange - shipSize : seaRange;
                const x = Math.floor(Math.random() * maxX);
                const y = Math.floor(Math.random() * maxY);
                
                // 检查是否可以放置（包括周围区域）
                if (this.canPlaceShip(map, x, y, shipSize, isHorizontal, seaRange)) {
                    // 放置舰船
                    for (let j = 0; j < shipSize; j++) {
                        const cellX = isHorizontal ? x : x + j;
                        const cellY = isHorizontal ? y + j : y;
                        const index = cellX * seaRange + cellY;
                        map[index] = 1;
                    }
                    placed = true;
                }
            }
            
            // 如果无法放置，重置地图并重新开始
            if (!placed) {
                console.log('无法放置舰船，重置地图');
                i = -1; // 重新开始循环
                for (let j = 0; j < map.length; j++) {
                    map[j] = 0;
                }
            }
        }
        
        return map;
    },
    
    // 检查是否可以放置舰船（包括周围区域）
    canPlaceShip: function(map, x, y, size, isHorizontal, seaRange) {
        // 检查舰船本身
        for (let i = 0; i < size; i++) {
            const cellX = isHorizontal ? x : x + i;
            const cellY = isHorizontal ? y + i : y;
            
            // 检查是否超出边界
            if (cellX < 0 || cellX >= seaRange || cellY < 0 || cellY >= seaRange) {
                return false;
            }
            
            const index = cellX * seaRange + cellY;
            if (map[index] === 1) {
                return false; // 已有舰船
            }
        }
        
        // 检查周围区域（避免舰船相邻）
        for (let i = -1; i <= size; i++) {
            for (let j = -1; j <= 1; j++) {
                for (let k = -1; k <= 1; k++) {
                    const cellX = isHorizontal ? x + i : x + j;
                    const cellY = isHorizontal ? y + j : y + i;
                    
                    // 检查是否在地图范围内
                    if (cellX >= 0 && cellX < seaRange && cellY >= 0 && cellY < seaRange) {
                        const index = cellX * seaRange + cellY;
                        // 如果周围有舰船，且不是当前要放置的舰船位置
                        if (map[index] === 1) {
                            const isPartOfCurrentShip = isHorizontal ? 
                                (cellX === x && cellY >= y && cellY < y + size) : 
                                (cellY === y && cellX >= x && cellX < x + size);
                                
                            if (!isPartOfCurrentShip) {
                                return false; // 周围有其他舰船
                            }
                        }
                    }
                }
            }
        }
        
        return true;
    }
};

// 扩展LocalServer对象，增强AI功能
if (typeof LocalServer !== 'undefined') {
    // 保存原始方法的引用
    const originalGenerateRandomMap = LocalServer.generateRandomMap;
    const originalPerformAIOperation = LocalServer.performAIOperation;
    
    // 重写生成随机地图方法，使用更智能的部署
    LocalServer.generateRandomMap = function(seaRange) {
        return AIOpponent.generateSmartShipDeployment(seaRange);
    };
    
    // 重写AI操作方法，使用更智能的攻击策略
    LocalServer.performAIOperation = function(roomId, aiNickname) {
        const battle = this.battleMap[roomId];
        const playerNickname = Game.nickname;
        
        // 如果不是AI回合或游戏已结束，不执行操作
        if (battle.turns !== battle.players.indexOf(aiNickname) || battle.status !== 2) {
            return;
        }
        
        // 获取玩家地图
        const playerMap = battle.maps[playerNickname];
        const seaRange = battle.sea_range;
        
        // 获取之前的攻击
        const previousAttacks = battle.ops.filter(op => op.nickname === aiNickname);
        
        // 使用AI对手生成攻击
        const move = AIOpponent.generateAttack(playerMap, previousAttacks, seaRange);
        
        // 如果没有可能的移动，返回
        if (!move) {
            return;
        }
        
        // 执行攻击
        this.executeAttack(roomId, aiNickname, move.x, move.y);
    };
    
    console.log('AI对手功能已增强');
}

// 页面加载完成后初始化AI对手
$(document).ready(function() {
    // 初始化AI对手
    setTimeout(() => {
        AIOpponent.init();
    }, 500); // 延迟初始化，确保LocalServer已加载
});
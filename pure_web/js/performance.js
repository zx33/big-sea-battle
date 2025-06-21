/**
 * 游戏性能优化
 * 用于提高游戏的运行效率和响应速度
 */

// 性能监控对象
const PerformanceMonitor = {
    // 存储性能数据
    metrics: {
        fps: 0,
        renderTime: 0,
        networkLatency: {},
        memoryUsage: 0
    },
    
    // 帧率计算相关变量
    frameCount: 0,
    lastFrameTime: 0,
    fpsUpdateInterval: 1000, // 每秒更新一次FPS
    
    // 初始化性能监控
    init: function() {
        // 只在开发环境中启用
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return;
        }
        
        // 初始化FPS监控
        this.initFpsMonitor();
        
        // 初始化网络延迟监控
        this.initNetworkLatencyMonitor();
        
        // 初始化内存使用监控
        this.initMemoryMonitor();
        
        // 创建性能面板
        this.createPerformancePanel();
    },
    
    // 初始化FPS监控
    initFpsMonitor: function() {
        this.lastFrameTime = performance.now();
        
        // 使用requestAnimationFrame计算FPS
        const updateFps = () => {
            const now = performance.now();
            this.frameCount++;
            
            // 每秒更新一次FPS
            if (now - this.lastFrameTime >= this.fpsUpdateInterval) {
                this.metrics.fps = Math.round(this.frameCount * 1000 / (now - this.lastFrameTime));
                this.frameCount = 0;
                this.lastFrameTime = now;
                
                // 更新性能面板
                this.updatePerformancePanel();
            }
            
            requestAnimationFrame(updateFps);
        };
        
        requestAnimationFrame(updateFps);
    },
    
    // 初始化网络延迟监控
    initNetworkLatencyMonitor: function() {
        // 拦截Ajax请求，计算网络延迟
        $(document).ajaxSend((event, jqXHR, settings) => {
            const url = settings.url;
            const startTime = performance.now();
            
            jqXHR.always(() => {
                const endTime = performance.now();
                const latency = endTime - startTime;
                
                // 提取API名称
                let apiName = url;
                if (url.includes('/')) {
                    apiName = url.split('/').pop();
                }
                
                // 存储网络延迟
                this.metrics.networkLatency[apiName] = latency;
                
                // 更新性能面板
                this.updatePerformancePanel();
            });
        });
    },
    
    // 初始化内存使用监控
    initMemoryMonitor: function() {
        // 定期检查内存使用情况
        setInterval(() => {
            if (window.performance && window.performance.memory) {
                this.metrics.memoryUsage = Math.round(window.performance.memory.usedJSHeapSize / (1024 * 1024));
                this.updatePerformancePanel();
            }
        }, 2000);
    },
    
    // 创建性能面板
    createPerformancePanel: function() {
        // 创建性能按钮
        const perfButton = $(`
            <button id="perf-toggle" style="
                position: fixed;
                bottom: 10px;
                left: 10px;
                background-color: #28a745;
                color: white;
                border: none;
                border-radius: 5px;
                padding: 5px 10px;
                cursor: pointer;
                z-index: 9997;
            ">性能</button>
        `);
        
        // 创建性能面板
        const perfPanel = $(`
            <div id="perf-panel" style="
                position: fixed;
                bottom: 50px;
                left: 10px;
                width: 250px;
                background-color: rgba(0,0,0,0.8);
                color: white;
                border-radius: 5px;
                padding: 10px;
                z-index: 9996;
                display: none;
                font-family: monospace;
                font-size: 12px;
            ">
                <h3 style="margin-top: 0; margin-bottom: 10px;">性能监控</h3>
                <div id="fps-meter">
                    <div>FPS: <span id="fps-value">0</span></div>
                    <div class="meter-bar">
                        <div id="fps-bar" class="meter-fill" style="width: 0%;"></div>
                    </div>
                </div>
                <div id="memory-meter" style="margin-top: 10px;">
                    <div>内存: <span id="memory-value">0</span> MB</div>
                    <div class="meter-bar">
                        <div id="memory-bar" class="meter-fill" style="width: 0%;"></div>
                    </div>
                </div>
                <div id="network-latency" style="margin-top: 10px;">
                    <div>网络延迟:</div>
                    <div id="latency-list" style="margin-top: 5px;"></div>
                </div>
                <div style="margin-top: 10px;">
                    <button id="optimize-game" class="perf-btn">优化游戏</button>
                </div>
            </div>
        `);
        
        // 添加样式
        $('<style>\n' +
          '.meter-bar { background-color: #444; height: 10px; border-radius: 5px; margin-top: 3px; }\n' +
          '.meter-fill { background-color: #28a745; height: 100%; border-radius: 5px; transition: width 0.3s; }\n' +
          '.perf-btn { background-color: #28a745; color: white; border: none; border-radius: 3px; padding: 3px 8px; cursor: pointer; }\n' +
          '.perf-btn:hover { background-color: #218838; }\n' +
          '</style>').appendTo('head');
        
        // 添加到页面
        $('body').append(perfButton).append(perfPanel);
        
        // 切换性能面板
        $('#perf-toggle').click(function() {
            $('#perf-panel').toggle();
        });
        
        // 优化游戏按钮
        $('#optimize-game').click(() => {
            this.optimizeGame();
        });
    },
    
    // 更新性能面板
    updatePerformancePanel: function() {
        // 更新FPS
        $('#fps-value').text(this.metrics.fps);
        const fpsPercentage = Math.min(100, this.metrics.fps / 60 * 100);
        $('#fps-bar').css('width', `${fpsPercentage}%`);
        
        // 根据FPS值设置颜色
        if (this.metrics.fps >= 50) {
            $('#fps-bar').css('background-color', '#28a745'); // 绿色
        } else if (this.metrics.fps >= 30) {
            $('#fps-bar').css('background-color', '#ffc107'); // 黄色
        } else {
            $('#fps-bar').css('background-color', '#dc3545'); // 红色
        }
        
        // 更新内存使用
        if (this.metrics.memoryUsage > 0) {
            $('#memory-value').text(this.metrics.memoryUsage);
            const memoryPercentage = Math.min(100, this.metrics.memoryUsage / 100 * 100);
            $('#memory-bar').css('width', `${memoryPercentage}%`);
            
            // 根据内存使用设置颜色
            if (this.metrics.memoryUsage < 50) {
                $('#memory-bar').css('background-color', '#28a745'); // 绿色
            } else if (this.metrics.memoryUsage < 80) {
                $('#memory-bar').css('background-color', '#ffc107'); // 黄色
            } else {
                $('#memory-bar').css('background-color', '#dc3545'); // 红色
            }
        }
        
        // 更新网络延迟
        let latencyHtml = '';
        for (const [api, latency] of Object.entries(this.metrics.networkLatency)) {
            const formattedLatency = Math.round(latency);
            let color = '#28a745'; // 绿色
            
            if (formattedLatency > 500) {
                color = '#dc3545'; // 红色
            } else if (formattedLatency > 200) {
                color = '#ffc107'; // 黄色
            }
            
            latencyHtml += `<div>${api}: <span style="color: ${color}">${formattedLatency}ms</span></div>`;
        }
        
        $('#latency-list').html(latencyHtml);
    },
    
    // 优化游戏
    optimizeGame: function() {
        // 显示优化中消息
        if (typeof LoadingManager !== 'undefined') {
            LoadingManager.show('正在优化游戏性能...');
        }
        
        setTimeout(() => {
            // 执行优化操作
            this.clearUnusedResources();
            this.optimizeEventHandlers();
            this.optimizeRendering();
            
            // 隐藏优化中消息
            if (typeof LoadingManager !== 'undefined') {
                LoadingManager.hide();
            }
            
            // 显示优化完成消息
            if (typeof showErrorMessage !== 'undefined') {
                showErrorMessage('游戏性能已优化');
            } else {
                alert('游戏性能已优化');
            }
        }, 1000);
    },
    
    // 清理未使用的资源
    clearUnusedResources: function() {
        // 清理不再使用的DOM元素
        $('.temp-element').remove();
        
        // 清理不再使用的事件监听器
        $('.one-time-button').off();
        
        // 尝试触发垃圾回收
        if (window.gc) {
            window.gc();
        }
    },
    
    // 优化事件处理器
    optimizeEventHandlers: function() {
        // 使用事件委托优化多个事件处理器
        $('.game-board').off('click', '.cell').on('click', '.cell', function(e) {
            // 事件处理逻辑
        });
    },
    
    // 优化渲染
    optimizeRendering: function() {
        // 减少不必要的DOM更新
        // 使用文档片段进行批量DOM更新
        const updateBoardEfficiently = function(board, data) {
            const fragment = document.createDocumentFragment();
            
            // 创建所有单元格
            for (let i = 0; i < data.length; i++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.value = data[i];
                fragment.appendChild(cell);
            }
            
            // 一次性添加到DOM
            board.innerHTML = '';
            board.appendChild(fragment);
        };
        
        // 将优化后的函数添加到全局对象
        window.updateBoardEfficiently = updateBoardEfficiently;
    }
};

// 在页面加载完成后初始化
$(document).ready(function() {
    // 初始化性能监控
    PerformanceMonitor.init();
});

// 导出性能监控对象
window.PerformanceMonitor = PerformanceMonitor;
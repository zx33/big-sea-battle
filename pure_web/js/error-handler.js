/**
 * 错误处理和调试辅助
 * 用于捕获和处理游戏中可能出现的错误
 */

// 全局错误处理
window.onerror = function(message, source, lineno, colno, error) {
    console.error('全局错误:', message, '来源:', source, '行:', lineno, '列:', colno, '错误对象:', error);
    
    // 显示友好的错误消息
    showErrorMessage('游戏运行出错，请查看控制台获取详细信息。');
    
    return true; // 阻止默认错误处理
};

// 未捕获的Promise错误
window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的Promise拒绝:', event.reason);
    
    // 显示友好的错误消息
    showErrorMessage('网络请求失败，请确保后端服务器已启动。');
});

// 显示错误消息
function showErrorMessage(message) {
    // 如果已经存在错误消息框，则更新内容
    if ($('#error-message').length > 0) {
        $('#error-message').text(message);
        return;
    }
    
    // 创建错误消息框
    const errorDiv = $(`
        <div id="error-container" style="
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #f8d7da;
            color: #721c24;
            padding: 10px 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: space-between;
        ">
            <span id="error-message">${message}</span>
            <button id="close-error" style="
                background: none;
                border: none;
                color: #721c24;
                font-weight: bold;
                cursor: pointer;
                margin-left: 15px;
            ">×</button>
        </div>
    `);
    
    // 添加到页面
    $('body').append(errorDiv);
    
    // 关闭按钮事件
    $('#close-error').click(function() {
        $('#error-container').remove();
    });
    
    // 5秒后自动关闭
    setTimeout(function() {
        $('#error-container').fadeOut('slow', function() {
            $(this).remove();
        });
    }, 5000);
}

// 添加调试工具
function addDebugTools() {
    // 只在开发环境中启用
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return;
    }
    
    // 创建调试按钮
    const debugButton = $(`
        <button id="debug-toggle" style="
            position: fixed;
            bottom: 10px;
            right: 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            padding: 5px 10px;
            cursor: pointer;
            z-index: 9999;
        ">调试</button>
    `);
    
    // 创建调试面板
    const debugPanel = $(`
        <div id="debug-panel" style="
            position: fixed;
            bottom: 50px;
            right: 10px;
            width: 300px;
            background-color: rgba(0,0,0,0.8);
            color: white;
            border-radius: 5px;
            padding: 10px;
            z-index: 9998;
            display: none;
        ">
            <h3 style="margin-top: 0;">调试面板</h3>
            <div>
                <button id="check-connection" class="debug-btn">检查连接</button>
                <button id="reset-game" class="debug-btn">重置游戏</button>
                <button id="toggle-logs" class="debug-btn">显示日志</button>
            </div>
            <div id="debug-log" style="
                margin-top: 10px;
                max-height: 200px;
                overflow-y: auto;
                font-family: monospace;
                font-size: 12px;
                background-color: #222;
                padding: 5px;
                display: none;
            "></div>
        </div>
    `);
    
    // 添加样式
    $('<style>\n' +
      '.debug-btn { background-color: #555; color: white; border: none; border-radius: 3px; padding: 3px 8px; margin-right: 5px; cursor: pointer; }\n' +
      '.debug-btn:hover { background-color: #777; }\n' +
      '</style>').appendTo('head');
    
    // 添加到页面
    $('body').append(debugButton).append(debugPanel);
    
    // 切换调试面板
    $('#debug-toggle').click(function() {
        $('#debug-panel').toggle();
    });
    
    // 检查连接
    $('#check-connection').click(function() {
        $.get(`${Game.apiBaseUrl}/get_status`, function() {
            logDebug('连接成功：后端服务器可访问');
        }).fail(function() {
            logDebug('连接失败：无法访问后端服务器');
        });
    });
    
    // 重置游戏
    $('#reset-game').click(function() {
        backToHome();
        logDebug('游戏已重置');
    });
    
    // 切换日志
    $('#toggle-logs').click(function() {
        $('#debug-log').toggle();
    });
}

// 记录调试信息
function logDebug(message) {
    const timestamp = new Date().toLocaleTimeString();
    $('#debug-log').prepend(`<div>[${timestamp}] ${message}</div>`);
    console.log(`[DEBUG] ${message}`);
}

// 在页面加载完成后初始化
$(document).ready(function() {
    // 添加调试工具
    addDebugTools();
});
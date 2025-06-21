/**
 * 加载动画组件
 * 用于在网络请求和游戏状态变化时显示加载状态
 */

// 加载动画管理器
const LoadingManager = {
    // 显示加载动画
    show: function(message = '加载中...') {
        // 如果已经存在加载动画，则更新消息
        if ($('#loading-container').length > 0) {
            $('#loading-message').text(message);
            return;
        }
        
        // 创建加载动画
        const loadingDiv = $(`
            <div id="loading-container" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            ">
                <div style="
                    background-color: white;
                    padding: 20px;
                    border-radius: 10px;
                    text-align: center;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
                ">
                    <div class="spinner" style="
                        width: 40px;
                        height: 40px;
                        margin: 0 auto 15px;
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #3498db;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    "></div>
                    <p id="loading-message" style="
                        margin: 0;
                        font-size: 16px;
                        color: #333;
                    ">${message}</p>
                </div>
            </div>
        `);
        
        // 添加动画样式
        $('<style>\n' +
          '@keyframes spin {\n' +
          '  0% { transform: rotate(0deg); }\n' +
          '  100% { transform: rotate(360deg); }\n' +
          '}\n' +
          '</style>').appendTo('head');
        
        // 添加到页面
        $('body').append(loadingDiv);
    },
    
    // 隐藏加载动画
    hide: function() {
        $('#loading-container').fadeOut('fast', function() {
            $(this).remove();
        });
    },
    
    // 更新加载消息
    updateMessage: function(message) {
        $('#loading-message').text(message);
    }
};

// 拦截Ajax请求，自动显示加载动画
function setupAjaxLoading() {
    let activeRequests = 0;
    
    // 添加Ajax请求拦截器
    $(document).ajaxSend(function(event, jqXHR, settings) {
        // 增加活动请求计数
        activeRequests++;
        
        // 显示加载动画
        if (activeRequests === 1) {
            // 获取请求类型和URL，用于显示更具体的加载消息
            const method = settings.type || 'GET';
            const url = settings.url || '';
            let message = '加载中...';
            
            // 根据URL显示更具体的消息
            if (url.includes('new_game')) {
                message = '创建游戏中...';
            } else if (url.includes('join_game')) {
                message = '加入游戏中...';
            } else if (url.includes('set_map')) {
                message = '设置地图中...';
            } else if (url.includes('set_op')) {
                message = '执行操作中...';
            } else if (url.includes('get_winner')) {
                message = '获取游戏结果...';
            }
            
            LoadingManager.show(message);
        }
    });
    
    // 添加Ajax请求完成拦截器
    $(document).ajaxComplete(function(event, jqXHR, settings) {
        // 减少活动请求计数
        activeRequests--;
        
        // 如果没有活动请求，隐藏加载动画
        if (activeRequests <= 0) {
            activeRequests = 0;
            LoadingManager.hide();
        }
    });
    
    // 添加Ajax错误拦截器
    $(document).ajaxError(function(event, jqXHR, settings, thrownError) {
        // 减少活动请求计数
        activeRequests--;
        
        // 如果没有活动请求，隐藏加载动画
        if (activeRequests <= 0) {
            activeRequests = 0;
            LoadingManager.hide();
        }
        
        // 显示错误消息
        if (typeof showErrorMessage === 'function') {
            let errorMsg = '网络请求失败';
            
            if (jqXHR.status === 0) {
                errorMsg = '无法连接到服务器，请确保后端服务器已启动';
            } else if (jqXHR.status === 404) {
                errorMsg = '请求的资源不存在 (404)';
            } else if (jqXHR.status === 500) {
                errorMsg = '服务器内部错误 (500)';
            } else if (thrownError === 'parsererror') {
                errorMsg = '解析JSON响应失败';
            } else if (thrownError === 'timeout') {
                errorMsg = '请求超时';
            } else if (thrownError === 'abort') {
                errorMsg = '请求被中止';
            }
            
            showErrorMessage(errorMsg);
        }
    });
}

// 在页面加载完成后初始化
$(document).ready(function() {
    // 设置Ajax加载动画
    setupAjaxLoading();
});

// 导出加载管理器
window.LoadingManager = LoadingManager;
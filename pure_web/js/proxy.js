/**
 * 跨域代理配置
 * 用于解决浏览器同源策略限制
 */

// 检测是否需要添加CORS头
function addCORSHeaders() {
    // 监听所有XMLHttpRequest
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
        // 拦截请求
        this.addEventListener('readystatechange', function() {
            if (this.readyState === 4) {
                // 检查是否有CORS错误
                if (!this.responseURL.startsWith(window.location.origin) && 
                    (this.status === 0 || this.responseText === '')) {
                    console.error('CORS Error detected for: ' + url);
                    // 显示友好的错误消息
                    alert('跨域请求错误：无法连接到游戏服务器。请确保后端服务器已启动，并允许跨域请求。');
                }
            }
        });
        
        // 调用原始方法
        return originalOpen.apply(this, arguments);
    };
}

// 添加JSONP支持
function setupJSONP() {
    window.jsonpCallback = function(data) {
        console.log('JSONP response:', data);
        // 处理JSONP响应
        if (window.currentJSONPCallback) {
            window.currentJSONPCallback(data);
            window.currentJSONPCallback = null;
        }
    };
}

// 初始化代理
function initProxy() {
    // 添加CORS头
    addCORSHeaders();
    
    // 设置JSONP
    setupJSONP();
    
    console.log('API代理已初始化');
}

// 在页面加载完成后初始化代理
$(document).ready(function() {
    initProxy();
});
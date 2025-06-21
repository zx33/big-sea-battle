/**
 * 本地服务器适配器 - 将Ajax请求重定向到本地游戏引擎
 * 这个文件作为适配层，保持原有代码接口不变，但内部实现改为直接调用本地函数
 */

// 本地服务器适配器对象
const LocalServerAdapter = {
    // 初始化适配器
    init: function() {
        console.log('本地服务器适配器已初始化');
        
        // 确保本地游戏引擎已初始化
        if (typeof LocalGameEngine === 'undefined') {
            console.error('错误：本地游戏引擎未加载，请确保在local-server-adapter.js之前引入local-game-engine.js');
            return;
        }
        
        // 拦截API请求并重定向到本地游戏引擎
        this.setupAPIInterceptor();
    },
    
    // 设置API拦截器
    setupAPIInterceptor: function() {
        const self = this;
        
        // 保存原始的jQuery ajax方法
        const originalAjax = $.ajax;
        
        // 重写jQuery ajax方法
        $.ajax = function(options) {
            const url = options.url || '';
            
            // 检查是否是游戏API请求
            if (url.includes('/2.0/')) {
                return self.handleAPIRequest(options);
            }
            
            // 非游戏API请求使用原始方法
            return originalAjax.apply(this, arguments);
        };
        
        // 重写jQuery get方法
        $.get = function(url, data, callback, type) {
            // 处理参数
            if ($.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }
            
            return $.ajax({
                url: url,
                type: 'GET',
                data: data,
                success: callback,
                dataType: type
            });
        };
        
        // 重写jQuery post方法
        $.post = function(url, data, callback, type) {
            // 处理参数
            if ($.isFunction(data)) {
                type = type || callback;
                callback = data;
                data = undefined;
            }
            
            return $.ajax({
                url: url,
                type: 'POST',
                data: data,
                success: callback,
                dataType: type
            });
        };
    },
    
    // 处理API请求
    handleAPIRequest: function(options) {
        const url = options.url;
        const method = options.type || 'GET';
        const data = options.data || {};
        const success = options.success || function() {};
        const error = options.error || function() {};
        
        // 提取API路径
        const apiPath = url.split('/2.0/')[1];
        
        // 直接调用本地游戏引擎函数，无需模拟网络延迟
        try {
            // 根据API路径分发到对应处理函数
            let result;
            
            const roomId = parseInt(LocalGameEngine.getCookie('room_id'));
            const nickname = LocalGameEngine.getCookie('nickname');
            
            if (apiPath === 'new_game') {
                result = LocalGameEngine.createGame(data.game_type, parseInt(data.sea_range));
            } else if (apiPath === 'join_game') {
                result = LocalGameEngine.joinGame(parseInt(data.room_id), data.nickname);
            } else if (apiPath === 'get_status') {
                result = LocalGameEngine.getGameStatus(roomId);
            } else if (apiPath === 'get_players') {
                result = LocalGameEngine.getPlayers(roomId);
            } else if (apiPath === 'set_map') {
                result = LocalGameEngine.setMap(roomId, nickname, data.map_info);
            } else if (apiPath === 'curr_op_cnt') {
                result = LocalGameEngine.getCurrentOpCount(roomId);
            } else if (apiPath === 'get_op') {
                result = LocalGameEngine.getOperation(roomId, data.op_cnt);
            } else if (apiPath === 'set_op') {
                result = LocalGameEngine.setOperation(roomId, nickname, data.x, data.y);
            } else if (apiPath === 'get_winner') {
                result = LocalGameEngine.getWinner(roomId, nickname);
            } else if (apiPath === 'guess') {
                result = LocalGameEngine.makeGuess(roomId, nickname, data.map_info);
            } else {
                // 未知API
                throw { code: 404, msg: '未知API' };
            }
            
            // 调用成功回调
            if (result.status === 'ok') {
                success(result);
            } else {
                error(result);
            }
        } catch (err) {
            // 调用错误回调
            error({
                status: 'error',
                msg: err.msg || '未知错误',
                result: null
            });
        }
        
        // 返回一个Promise对象以兼容jQuery ajax
        return {
            done: function(callback) {
                this.successCallback = callback;
                return this;
            },
            fail: function(callback) {
                this.errorCallback = callback;
                return this;
            },
            always: function(callback) {
                this.alwaysCallback = callback;
                return this;
            }
        };
    }
};

// 页面加载完成后初始化本地服务器适配器
$(document).ready(function() {
    // 初始化本地服务器适配器
    LocalServerAdapter.init();
    
    console.log('本地服务器适配器已启用，API请求将直接调用本地游戏引擎函数');
});

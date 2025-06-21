/**
 * 大海战网页版代理服务器
 * 用于解决跨域问题，代理API请求到后端服务器
 */

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = 'http://localhost:2333'; // 后端服务器地址

// 启用CORS
app.use(cors());

// 设置静态文件目录
app.use(express.static(path.join(__dirname)));

// 代理API请求到后端服务器
app.use('/2.0', createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/2.0': '/2.0' // 保持路径不变
    },
    onProxyReq: (proxyReq, req, res) => {
        // 在代理请求中添加必要的头信息
        proxyReq.setHeader('Origin', BACKEND_URL);
    },
    onError: (err, req, res) => {
        console.error('代理错误:', err);
        res.status(500).json({
            status: 'error',
            msg: '无法连接到后端服务器'
        });
    }
}));

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`大海战网页版代理服务器已启动，访问 http://localhost:${PORT} 开始游戏`);
    console.log(`API请求将被代理到 ${BACKEND_URL}`);
    console.log('按 Ctrl+C 停止服务器');
});
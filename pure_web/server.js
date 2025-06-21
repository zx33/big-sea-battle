/**
 * 大海战网页版本地服务器
 * 这个简单的服务器用于在本地运行大海战网页版游戏
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 设置静态文件目录
app.use(express.static(path.join(__dirname)));

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`大海战网页版服务器已启动，访问 http://localhost:${PORT} 开始游戏`);
    console.log('按 Ctrl+C 停止服务器');
});
# 大海战

一个仿照大海战的小游戏工程。

## 游戏玩法

游戏采取双方对战形式进行。

双方加入房间后，在一个6\*6网格内，放置1\*2和1\*3的两条战舰。

双方布置完成后，游戏开始。双方轮流在6\*6网格内选取单元格放置炸弹，如果该单元格存在船体，则得分+1。率先炸掉所有对方船只的一方获得游戏胜利，或在规定操作内，得分高的一方获胜。

## 更新日志

### Backend

* 5.16 添加获取指定battle状态功能
* 5.15 修复get\_op接口的Bug，优化在双方set_map阶段请求get\_op的返回结果
* 5.14 添加后台相关start scripts命令
* 5.12 修复程序中的小Bug，完善Error提示内容
* 5.12 添加玩家获取操作、设置操作功能
* 5.11 添加创建游戏、加入游戏、设置地图功能

### Client

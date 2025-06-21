/**
 * 游戏教程和帮助
 * 用于指导新玩家了解游戏规则和操作方式
 */

// 教程管理器
const TutorialManager = {
    // 教程步骤
    steps: [
        {
            title: '欢迎来到大海战！',
            content: '大海战是一款经典的战舰部署与对战游戏。本教程将指导你了解游戏规则和操作方式。',
            target: 'body',
            position: 'center'
        },
        {
            title: '游戏模式',
            content: '游戏提供三种模式：普通模式、竞速模式和预判模式。普通模式是经典玩法，竞速模式比拼速度，预判模式需要预测对手行动。',
            target: '#game-type-select',
            position: 'bottom'
        },
        {
            title: '创建或加入游戏',
            content: '你可以创建一个新游戏并邀请朋友加入，或者输入房间ID加入朋友创建的游戏。',
            target: '#create-game-btn',
            position: 'right'
        },
        {
            title: '部署你的舰队',
            content: '游戏开始前，你需要在自己的海域中部署舰船。点击舰船然后点击海域中的格子来放置舰船。按R键可以旋转舰船方向。',
            target: '#deployment-screen',
            position: 'top'
        },
        {
            title: '攻击敌方海域',
            content: '轮到你的回合时，点击敌方海域中的格子发动攻击。命中敌舰会显示为红色，未命中则为白色。',
            target: '#enemy-board',
            position: 'top'
        },
        {
            title: '游戏目标',
            content: '率先摧毁对方所有舰船的玩家获胜。密切关注游戏状态和回合信息，制定最佳策略！',
            target: '#game-info',
            position: 'bottom'
        }
    ],
    
    // 当前步骤索引
    currentStep: 0,
    
    // 是否正在显示教程
    isActive: false,
    
    // 显示教程
    show: function() {
        // 如果已经在显示教程，则返回
        if (this.isActive) {
            return;
        }
        
        // 设置教程为活动状态
        this.isActive = true;
        
        // 重置当前步骤
        this.currentStep = 0;
        
        // 创建教程遮罩
        this.createTutorialOverlay();
        
        // 显示第一步
        this.showStep(this.currentStep);
    },
    
    // 创建教程遮罩
    createTutorialOverlay: function() {
        // 如果已经存在教程遮罩，则返回
        if ($('#tutorial-overlay').length > 0) {
            return;
        }
        
        // 创建教程遮罩
        const overlay = $(`
            <div id="tutorial-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div id="tutorial-highlight" style="
                    position: absolute;
                    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
                    border-radius: 5px;
                    pointer-events: none;
                    transition: all 0.3s ease;
                "></div>
                <div id="tutorial-box" style="
                    position: absolute;
                    background-color: white;
                    border-radius: 10px;
                    padding: 20px;
                    max-width: 400px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                    transition: all 0.3s ease;
                ">
                    <h3 id="tutorial-title" style="
                        margin-top: 0;
                        color: #333;
                    "></h3>
                    <p id="tutorial-content" style="
                        color: #666;
                        line-height: 1.5;
                    "></p>
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        margin-top: 20px;
                    ">
                        <button id="tutorial-prev" class="tutorial-btn" style="
                            background-color: #6c757d;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            padding: 8px 15px;
                            cursor: pointer;
                        ">上一步</button>
                        <button id="tutorial-next" class="tutorial-btn" style="
                            background-color: #007bff;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            padding: 8px 15px;
                            cursor: pointer;
                        ">下一步</button>
                        <button id="tutorial-close" class="tutorial-btn" style="
                            background-color: #dc3545;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            padding: 8px 15px;
                            cursor: pointer;
                        ">关闭</button>
                    </div>
                </div>
            </div>
        `);
        
        // 添加到页面
        $('body').append(overlay);
        
        // 添加按钮事件
        $('#tutorial-prev').click(() => {
            this.prevStep();
        });
        
        $('#tutorial-next').click(() => {
            this.nextStep();
        });
        
        $('#tutorial-close').click(() => {
            this.hide();
        });
    },
    
    // 显示指定步骤
    showStep: function(index) {
        // 获取当前步骤
        const step = this.steps[index];
        
        // 更新教程内容
        $('#tutorial-title').text(step.title);
        $('#tutorial-content').text(step.content);
        
        // 更新按钮状态
        $('#tutorial-prev').prop('disabled', index === 0).css('opacity', index === 0 ? 0.5 : 1);
        $('#tutorial-next').text(index === this.steps.length - 1 ? '完成' : '下一步');
        
        // 高亮目标元素
        this.highlightElement(step.target, step.position);
    },
    
    // 高亮目标元素
    highlightElement: function(target, position) {
        // 如果目标是body，则居中显示教程框
        if (target === 'body') {
            $('#tutorial-highlight').css({
                width: 0,
                height: 0,
                top: '50%',
                left: '50%'
            });
            
            $('#tutorial-box').css({
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            });
            
            return;
        }
        
        // 获取目标元素
        const $target = $(target);
        
        // 如果目标元素不存在，则居中显示教程框
        if ($target.length === 0) {
            $('#tutorial-highlight').css({
                width: 0,
                height: 0,
                top: '50%',
                left: '50%'
            });
            
            $('#tutorial-box').css({
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            });
            
            return;
        }
        
        // 获取目标元素位置和尺寸
        const targetOffset = $target.offset();
        const targetWidth = $target.outerWidth();
        const targetHeight = $target.outerHeight();
        
        // 设置高亮区域
        $('#tutorial-highlight').css({
            width: targetWidth + 10 + 'px',
            height: targetHeight + 10 + 'px',
            top: targetOffset.top - 5 + 'px',
            left: targetOffset.left - 5 + 'px'
        });
        
        // 设置教程框位置
        const boxWidth = $('#tutorial-box').outerWidth();
        const boxHeight = $('#tutorial-box').outerHeight();
        
        let boxTop, boxLeft;
        
        switch (position) {
            case 'top':
                boxTop = targetOffset.top - boxHeight - 20;
                boxLeft = targetOffset.left + targetWidth / 2 - boxWidth / 2;
                break;
            case 'bottom':
                boxTop = targetOffset.top + targetHeight + 20;
                boxLeft = targetOffset.left + targetWidth / 2 - boxWidth / 2;
                break;
            case 'left':
                boxTop = targetOffset.top + targetHeight / 2 - boxHeight / 2;
                boxLeft = targetOffset.left - boxWidth - 20;
                break;
            case 'right':
                boxTop = targetOffset.top + targetHeight / 2 - boxHeight / 2;
                boxLeft = targetOffset.left + targetWidth + 20;
                break;
            default:
                boxTop = targetOffset.top + targetHeight + 20;
                boxLeft = targetOffset.left + targetWidth / 2 - boxWidth / 2;
        }
        
        // 确保教程框不超出屏幕
        const windowWidth = $(window).width();
        const windowHeight = $(window).height();
        
        if (boxLeft < 20) boxLeft = 20;
        if (boxLeft + boxWidth > windowWidth - 20) boxLeft = windowWidth - boxWidth - 20;
        if (boxTop < 20) boxTop = 20;
        if (boxTop + boxHeight > windowHeight - 20) boxTop = windowHeight - boxHeight - 20;
        
        $('#tutorial-box').css({
            top: boxTop + 'px',
            left: boxLeft + 'px',
            transform: 'none'
        });
    },
    
    // 下一步
    nextStep: function() {
        // 如果已经是最后一步，则关闭教程
        if (this.currentStep === this.steps.length - 1) {
            this.hide();
            return;
        }
        
        // 显示下一步
        this.currentStep++;
        this.showStep(this.currentStep);
    },
    
    // 上一步
    prevStep: function() {
        // 如果已经是第一步，则返回
        if (this.currentStep === 0) {
            return;
        }
        
        // 显示上一步
        this.currentStep--;
        this.showStep(this.currentStep);
    },
    
    // 隐藏教程
    hide: function() {
        // 移除教程遮罩
        $('#tutorial-overlay').fadeOut('fast', function() {
            $(this).remove();
        });
        
        // 设置教程为非活动状态
        this.isActive = false;
        
        // 将教程完成状态保存到本地存储
        localStorage.setItem('tutorial_completed', 'true');
    },
    
    // 检查是否需要显示教程
    checkTutorial: function() {
        // 如果已经完成过教程，则不显示
        if (localStorage.getItem('tutorial_completed') === 'true') {
            return;
        }
        
        // 显示教程
        this.show();
    },
    
    // 添加帮助按钮
    addHelpButton: function() {
        // 如果已经存在帮助按钮，则返回
        if ($('#help-button').length > 0) {
            return;
        }
        
        // 创建帮助按钮
        const helpButton = $(`
            <button id="help-button" style="
                position: fixed;
                top: 10px;
                right: 10px;
                background-color: #17a2b8;
                color: white;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                font-size: 20px;
                line-height: 40px;
                text-align: center;
                cursor: pointer;
                z-index: 9995;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            ">?</button>
        `);
        
        // 添加到页面
        $('body').append(helpButton);
        
        // 添加点击事件
        $('#help-button').click(() => {
            this.show();
        });
    }
};

// 在页面加载完成后初始化
$(document).ready(function() {
    // 添加帮助按钮
    TutorialManager.addHelpButton();
    
    // 检查是否需要显示教程
    setTimeout(function() {
        TutorialManager.checkTutorial();
    }, 1000);
});

// 导出教程管理器
window.TutorialManager = TutorialManager;
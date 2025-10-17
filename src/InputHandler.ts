import { Game } from './core/Game';
import { MOVE_REPEAT_INTERVAL_MS, MOVE_REPEAT_ACCEL_MS, MOVE_ACCEL_DELAY_MS } from './core/Config';

export class InputHandler {
    private game: Game;
    private lastRotateTime: number = 0;
    private isMobile: boolean = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    constructor(game: Game) {
        this.game = game;
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
        
        // 添加移动端触摸控制事件
        this.setupMobileControls();

        // 移动端禁用长按弹出菜单（防止保存图片/选中）
        this.disableContextMenuOnMobile();
    }

    private setupMobileControls(): void {
        // 旋转按钮
        const rotateBtn = document.getElementById('btn-rotate');
        if (rotateBtn) {
            rotateBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.handleRotate(); }, { passive: false });
            rotateBtn.addEventListener('mousedown', this.handleRotate.bind(this));
        }
        
        // 左移按钮
        const leftBtn = document.getElementById('btn-left');
        if (leftBtn) {
            leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.handleLeftDown(); }, { passive: false });
            leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.handleLeftUp(); }, { passive: false });
            leftBtn.addEventListener('mousedown', this.handleLeftDown.bind(this));
            leftBtn.addEventListener('mouseup', this.handleLeftUp.bind(this));
            leftBtn.addEventListener('mouseleave', this.handleLeftUp.bind(this));
        }
        
        // 右移按钮
        const rightBtn = document.getElementById('btn-right');
        if (rightBtn) {
            rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.handleRightDown(); }, { passive: false });
            rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.handleRightUp(); }, { passive: false });
            rightBtn.addEventListener('mousedown', this.handleRightDown.bind(this));
            rightBtn.addEventListener('mouseup', this.handleRightUp.bind(this));
            rightBtn.addEventListener('mouseleave', this.handleRightUp.bind(this));
        }
        
        // 下移按钮
        const downBtn = document.getElementById('btn-down');
        if (downBtn) {
            downBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.handleDownDown(); }, { passive: false });
            downBtn.addEventListener('touchend', (e) => { e.preventDefault(); this.handleDownUp(); }, { passive: false });
            downBtn.addEventListener('mousedown', this.handleDownDown.bind(this));
            downBtn.addEventListener('mouseup', this.handleDownUp.bind(this));
            downBtn.addEventListener('mouseleave', this.handleDownUp.bind(this));
        }
    }

    private handleKeyDown(event: KeyboardEvent): void {
        if (this.game.gameOver) return;

        switch (event.key) {
            case 'ArrowLeft':
                this.game.moveBlockLeft();
                break;
            case 'ArrowRight':
                this.game.moveBlockRight();
                break;
            case 'ArrowDown':
                this.game.startSoftDrop();
                break;
            case 'ArrowUp':
                this.handleRotate();
                break;
        }
    }

    private handleKeyUp(event: KeyboardEvent): void {
        if (this.game.gameOver) return;

        if (event.key === 'ArrowDown') {
            this.game.stopSoftDrop();
        }
    }
    
    // 移动端控制处理函数
    private handleRotate(): void {
        if (this.game.gameOver) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastRotateTime >= 300) {
            this.game.rotateBlock();
            this.lastRotateTime = currentTime;
        }
    }
    
    private handleLeftDown(): void {
        if (this.game.gameOver) return;
        if (this.leftInterval) return; // 防止重复设置
        this.game.moveBlockLeft();
        // 设置重复移动的定时器，并在长按后加速
        this.leftInterval = window.setInterval(() => {
            this.game.moveBlockLeft();
        }, MOVE_REPEAT_INTERVAL_MS);

        // 加速定时器
        this.leftAccelTimeout = window.setTimeout(() => {
            if (this.leftInterval) {
                clearInterval(this.leftInterval);
                this.leftInterval = window.setInterval(() => {
                    this.game.moveBlockLeft();
                }, MOVE_REPEAT_ACCEL_MS);
            }
        }, MOVE_ACCEL_DELAY_MS);
    }
    
    private handleLeftUp(): void {
        if (this.leftInterval) {
            clearInterval(this.leftInterval);
            this.leftInterval = null;
        }
        if (this.leftAccelTimeout) {
            clearTimeout(this.leftAccelTimeout);
            this.leftAccelTimeout = null;
        }
    }
    
    private handleRightDown(): void {
        if (this.game.gameOver) return;
        if (this.rightInterval) return; // 防止重复设置
        this.game.moveBlockRight();
        // 设置重复移动的定时器，并在长按后加速
        this.rightInterval = window.setInterval(() => {
            this.game.moveBlockRight();
        }, MOVE_REPEAT_INTERVAL_MS);

        // 加速定时器
        this.rightAccelTimeout = window.setTimeout(() => {
            if (this.rightInterval) {
                clearInterval(this.rightInterval);
                this.rightInterval = window.setInterval(() => {
                    this.game.moveBlockRight();
                }, MOVE_REPEAT_ACCEL_MS);
            }
        }, MOVE_ACCEL_DELAY_MS);
    }
    
    private handleRightUp(): void {
        if (this.rightInterval) {
            clearInterval(this.rightInterval);
            this.rightInterval = null;
        }
        if (this.rightAccelTimeout) {
            clearTimeout(this.rightAccelTimeout);
            this.rightAccelTimeout = null;
        }
    }
    
    private handleDownDown(): void {
        if (this.game.gameOver) return;
        this.game.startSoftDrop();
    }
    
    private handleDownUp(): void {
        if (this.game.gameOver) return;
        this.game.stopSoftDrop();
    }
    
    // 移动控制的定时器引用
    private leftInterval: number | null = null;
    private rightInterval: number | null = null;
    private leftAccelTimeout: number | null = null;
    private rightAccelTimeout: number | null = null;

    // 移动端禁用长按弹出菜单（保存图片/文本选择）
    private disableContextMenuOnMobile(): void {
        if (!this.isMobile) return;
        const canvas = document.getElementById('game-canvas');
        const controls = document.getElementById('mobile-controls');

        const prevent = (e: Event) => e.preventDefault();
        document.addEventListener('contextmenu', prevent);
        if (canvas) canvas.addEventListener('contextmenu', prevent);
        if (controls) controls.addEventListener('contextmenu', prevent);
    }
}

import { Game } from './core/Game';

export class InputHandler {
    private game: Game;
    private lastRotateTime: number = 0;

    constructor(game: Game) {
        this.game = game;
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
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
                const currentTime = Date.now();
                if (currentTime - this.lastRotateTime >= 300) {
                    // 防止长按连续旋转
                    this.game.rotateBlock();
                    this.lastRotateTime = currentTime;
                }
                break;
        }
    }

    private handleKeyUp(event: KeyboardEvent): void {
        if (this.game.gameOver) return;

        if (event.key === 'ArrowDown') {
            this.game.stopSoftDrop();
        }
    }
}

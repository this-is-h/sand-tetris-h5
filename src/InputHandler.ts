import { Game } from './core/Game';
import { ROTATE_COOLDOWN } from './core/Config';

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
        this.game.moveShapeLeft();
        break;
      case 'ArrowRight':
        this.game.moveShapeRight();
        break;
      case 'ArrowDown':
        this.game.startSoftDrop();
        break;
      case 'ArrowUp':
        const currentTime = Date.now();
        if (currentTime - this.lastRotateTime >= 300) { // 防止长按连续旋转
          this.game.rotateShape();
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

import { Game } from './core/Game';

export class InputHandler {
  private game: Game;

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
        this.game.rotateShape();
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

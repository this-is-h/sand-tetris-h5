import { Game } from './core/Game';
import { SHAPES, ShapeType } from './core/Shape';

export class DebugMenu {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
    this.setupResetButton();
    this.setupClearBoardButton();
    this.setupHardDropButton();
    this.setupShapeSelector();
  }

  private setupResetButton(): void {
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.game.reset();
      });
    }
  }

  private setupClearBoardButton(): void {
    const clearButton = document.getElementById('clear-board-button');
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.game.clearBoard();
      });
    }
  }

  private setupHardDropButton(): void {
    const hardDropButton = document.getElementById('hard-drop-button');
    if (hardDropButton) {
      hardDropButton.addEventListener('click', () => {
        this.game.hardDrop();
      });
    }
  }

  private setupShapeSelector(): void {
    const selectorContainer = document.getElementById('shape-selector');
    if (!selectorContainer) return;

    const shapeTypes = Object.keys(SHAPES) as ShapeType[];

    for (const type of shapeTypes) {
      const button = document.createElement('button');
      button.innerText = type + '';
      button.addEventListener('click', () => {
        this.game.setNextShape(type);
      });
      selectorContainer.appendChild(button);
    }
  }
}

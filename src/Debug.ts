import { Game } from './Game';
import { SHAPES, ShapeType } from './Shape';

export class DebugMenu {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
    this.setupResetButton();
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

  private setupShapeSelector(): void {
    const selectorContainer = document.getElementById('shape-selector');
    if (!selectorContainer) return;

    const shapeTypes = Object.keys(SHAPES) as ShapeType[];

    for (const type of shapeTypes) {
      const button = document.createElement('button');
      button.innerText = type;
      button.addEventListener('click', () => {
        this.game.setNextShape(type);
      });
      selectorContainer.appendChild(button);
    }
  }
}

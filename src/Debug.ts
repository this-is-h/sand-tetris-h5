import { Game } from './core/Game';
import { BLOCKS, BlockType } from './core/Block';

const BlockTypeName = {
    [BlockType.I]: 'I',
    [BlockType.L]: 'L',
    [BlockType.J]: 'J',
    [BlockType.S]: 'S',
    [BlockType.Z]: 'Z',
    [BlockType.T]: 'T',
    [BlockType.O]: 'O',
}

export class DebugMenu {
    private game: Game;

    constructor(game: Game) {
        this.game = game;
        this.setupResetButton();
        this.setupClearBoardButton();
        this.setupHardDropButton();
        this.setupBlockSelector();
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

    private setupBlockSelector(): void {
        const selectorContainer = document.getElementById('block-selector');
        if (!selectorContainer) return;

        const blockTypes = Object.keys(BLOCKS) as BlockType[];

        for (const type of blockTypes) {
            const button = document.createElement('button');
            button.innerText = BlockTypeName[type];
            button.addEventListener('click', () => {
                this.game.setNextBlock(type);
            });
            selectorContainer.appendChild(button);
        }
    }
}

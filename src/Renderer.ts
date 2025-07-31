import { Block, ColorHex } from './core/Block';
import { BOARD_HEIGHT, BOARD_WIDTH, SCALE_FACTOR } from './core/Config';
import { Game } from './core/Game';
import { ClearEffect } from './Effect';

export class Renderer {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private nextBlockCanvas: HTMLCanvasElement;
    private nextBlockContext: CanvasRenderingContext2D;
    private scoreValueElement: HTMLElement; // 新增：分数显示元素
    private cellSize: number; // 每个沙粒的像素尺寸

    constructor(
        canvasId: string,
        nextBlockCanvasId: string,
        scoreValueElementId: string
    ) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d')!;

        this.nextBlockCanvas = document.getElementById(
            nextBlockCanvasId
        ) as HTMLCanvasElement;
        this.nextBlockContext = this.nextBlockCanvas.getContext('2d')!;

        this.scoreValueElement = document.getElementById(
            scoreValueElementId
        ) as HTMLElement; // 获取分数显示元素

        // 动态计算每个沙粒的尺寸，以适应画布大小
        this.cellSize = this.canvas.width / BOARD_WIDTH;
    }

    public render(
        game: Game,
        currentBlock: Block | null,
        nextBlock: Block | null,
        gameOver: boolean,
        score: number,
        activeClearEffects: ClearEffect[]
    ): void {
        this.clear();
        this.drawBoard(game);
        if (currentBlock) {
            this.drawBlock(currentBlock, this.context);
        }
        this.drawClearEffects(activeClearEffects);
        this.drawNextBlock(nextBlock); // 在独立的画布上绘制下一个图形
        this.updateScoreDisplay(score); // 更新分数显示

        if (gameOver) {
            this.drawGameOver();
        }
    }

    private clear(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.nextBlockContext.clearRect(0, 0, this.nextBlockCanvas.width, this.nextBlockCanvas.height);
    }

    private drawBoard(game: Game): void {
        const board = game.getBoard();
        const grid = board.getGrid();

        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const cellInfo = grid[y][x];
                if (cellInfo !== "") {
                    let colorType = board.getCellColor(x, y);
                    let color = ColorHex[colorType];
                    this.drawCell(
                        x,
                        y,
                        color,
                        this.context,
                        this.cellSize
                    );
                }
            }
        }
    }

    private drawBlock(block: Block, context: CanvasRenderingContext2D): void {
        const { x, y, matrix, color } = block;
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col]) {
                    this.drawCell(
                        x + col,
                        y + row,
                        ColorHex[color],
                        context,
                        this.cellSize
                    );
                }
            }
        }
    }

    private drawNextBlock(block: Block | null): void {
        if (!block) return;

        const { matrix, color } = block;
        const maxCellSize = 4; // 最大就是4格（I形）
        const nextCellSize = this.nextBlockCanvas.width / (maxCellSize * SCALE_FACTOR) / 1.5; // 1.5倍缩小

        const blockWidth = matrix[0].length;
        const blockHeight = matrix.length;
        const offsetX = (this.nextBlockCanvas.width - blockWidth * nextCellSize) / 2;
        const offsetY = (this.nextBlockCanvas.height - blockHeight * nextCellSize) / 2;

        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col]) {
                    this.drawCell(
                        offsetX / nextCellSize + col,
                        offsetY / nextCellSize + row,
                        ColorHex[color],
                        this.nextBlockContext,
                        nextCellSize
                    );
                }
            }
        }
    }

    private updateScoreDisplay(score: number): void {
        if (this.scoreValueElement) {
            this.scoreValueElement.innerText = score.toString();
        }
    }

    private drawCell(
        x: number,
        y: number,
        color: string,
        context: CanvasRenderingContext2D,
        cellSize: number
    ): void {
        context.fillStyle = color;
        // 确保绘制坐标是整数，并增加1像素以完全覆盖，消除缝隙
        context.fillRect(
            Math.floor(x * cellSize),
            Math.floor(y * cellSize),
            cellSize + 1,
            cellSize + 1
        );
    }

    private drawGameOver(): void {
        this.context.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.context.fillRect(
            0,
            this.canvas.height / 2 - 50,
            this.canvas.width,
            100
        );
        this.context.fillStyle = 'white';
        this.context.font = '48px sans-serif';
        this.context.textAlign = 'center';
        this.context.fillText(
            'Game Over',
            this.canvas.width / 2,
            this.canvas.height / 2 + 15
        );
    }

    private drawClearEffects(effects: ClearEffect[]): void {
        for (const effect of effects) {
            effect.draw(this.context, this.cellSize);
        }
    }
}
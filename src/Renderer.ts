import { Board, BOARD_WIDTH, BOARD_HEIGHT, Cell } from './Board';
import { Shape } from './Shape';
import { SCALE_FACTOR } from './config';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private nextShapeCanvas: HTMLCanvasElement;
  private nextShapeContext: CanvasRenderingContext2D;
  private scoreValueElement: HTMLElement; // 新增：分数显示元素
  private cellSize: number; // 每个沙粒的像素尺寸

  constructor(canvasId: string, nextShapeCanvasId: string, scoreValueElementId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.context = this.canvas.getContext('2d')!;

    this.nextShapeCanvas = document.getElementById(
      nextShapeCanvasId
    ) as HTMLCanvasElement;
    this.nextShapeContext = this.nextShapeCanvas.getContext('2d')!;

    this.scoreValueElement = document.getElementById(scoreValueElementId) as HTMLElement; // 获取分数显示元素

    // 动态计算每个沙粒的尺寸，以适应画布大小
    this.cellSize = this.canvas.width / BOARD_WIDTH;
  }

  public render(
    board: Board,
    currentShape: Shape | null,
    nextShape: Shape | null,
    gameOver: boolean,
    score: number // 接收分数
  ): void {
    this.clear();
    this.drawBoard(board);
    if (currentShape) {
      this.drawShape(currentShape, this.context);
    }
    this.drawNextShape(nextShape); // 在独立的画布上绘制下一个图形
    this.updateScoreDisplay(score); // 更新分数显示

    if (gameOver) {
      this.drawGameOver();
    }
  }

  private clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.nextShapeContext.clearRect(
      0,
      0,
      this.nextShapeCanvas.width,
      this.nextShapeCanvas.height
    );
  }

  private drawBoard(board: Board): void {
    const grid = board.getGrid();
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (grid[y][x] !== '') {
          this.drawCell(x, y, grid[y][x], this.context, this.cellSize);
        }
      }
    }
  }

  private drawShape(shape: Shape, context: CanvasRenderingContext2D): void {
    const { x, y, matrix, color } = shape;
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          this.drawCell(x + col, y + row, color, context, this.cellSize);
        }
      }
    }
  }

  private drawNextShape(shape: Shape | null): void {
    if (!shape) return;

    const { matrix, color } = shape;
    const nextCellSize = this.nextShapeCanvas.width / (4 * SCALE_FACTOR);

    const shapeWidth = matrix[0].length;
    const shapeHeight = matrix.length;
    const offsetX = (this.nextShapeCanvas.width - shapeWidth * nextCellSize) / 2;
    const offsetY = (this.nextShapeCanvas.height - shapeHeight * nextCellSize) / 2;

    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          this.drawCell(
            offsetX / nextCellSize + col,
            offsetY / nextCellSize + row,
            color,
            this.nextShapeContext,
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
}

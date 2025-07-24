import { Board, BOARD_WIDTH } from './Board';
import { Shape, ShapeType, SHAPES } from './Shape';

export class Game {
  private board: Board;
  public currentShape: Shape | null = null;
  public nextShape: Shape | null = null;
  public gameOver: boolean;
  public isSoftDropping: boolean;

  constructor() {
    this.initialize();
  }

  /**
   * 初始化或重置游戏状态
   */
  private initialize(): void {
    this.board = new Board();
    this.gameOver = false;
    this.isSoftDropping = false;
    this.currentShape = null;

    // 手动创建前两个图形
    const shapeTypes = Object.keys(SHAPES) as ShapeType[];
    const firstType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    this.nextShape = new Shape(firstType);
    this.spawnShape();
  }

  public getNextShape(): Shape | null {
    return this.nextShape;
  }

  public getBoard(): Board {
    return this.board;
  }

  private spawnShape(): void {
    this.currentShape = this.nextShape;

    if (this.currentShape) {
      this.currentShape.x = Math.floor(
        (BOARD_WIDTH - this.currentShape.matrix[0].length) / 2
      );
      this.currentShape.y = -this.currentShape.matrix.length;

      if (this.checkCollision()) {
        this.gameOver = true;
        this.currentShape = null;
        this.nextShape = null;
        return;
      }
    } else {
      if (this.gameOver) {
        return;
      }
    }

    const shapeTypes = Object.keys(SHAPES) as ShapeType[];
    const randomType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    this.nextShape = new Shape(randomType);
  }

  public moveShapeDown(): void {
    if (this.gameOver || !this.currentShape) return;
    this.currentShape.y++;
    if (this.checkCollision()) {
      this.currentShape.y--;

      if (this.currentShape.y < 0) {
        this.gameOver = true;
        return;
      }

      this.lockShape();
      this.spawnShape();
    }
  }

  public moveShapeLeft(): void {
    if (!this.currentShape) return;
    this.currentShape.x--;
    if (this.checkCollision()) {
      this.currentShape.x++;
    }
  }

  public moveShapeRight(): void {
    if (!this.currentShape) return;
    this.currentShape.x++;
    if (this.checkCollision()) {
      this.currentShape.x--;
    }
  }

  public rotateShape(): void {
    if (!this.currentShape) return;
    this.currentShape.rotate();
    if (this.checkCollision()) {
      this.currentShape.rotate();
      this.currentShape.rotate();
      this.currentShape.rotate();
    }
  }

  private checkCollision(): boolean {
    if (!this.currentShape) return false;
    const { x, y, matrix } = this.currentShape;
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          const boardX = x + col;
          const boardY = y + row;
          if (
            boardX < 0 ||
            boardX >= BOARD_WIDTH ||
            boardY >= this.board.getGrid().length ||
            (boardY >= 0 && this.board.getCell(boardX, boardY) !== '')
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private lockShape(): void {
    if (!this.currentShape) return;
    const { x, y, matrix, color } = this.currentShape;
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col]) {
          this.board.setCell(x + col, y + row, color);
        }
      }
    }
    this.board.clearSand();
    this.board.updateSand();
  }

  public startSoftDrop(): void {
    if (this.gameOver) return;
    this.isSoftDropping = true;
  }

  public stopSoftDrop(): void {
    if (this.gameOver) return;
    this.isSoftDropping = false;
  }

  public setNextShape(type: ShapeType): void {
    this.nextShape = new Shape(type);
  }

  public reset(): void {
    this.initialize();
  }
}

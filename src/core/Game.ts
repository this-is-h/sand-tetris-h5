import { Board, BOARD_WIDTH } from './Board';
import { Shape, ShapeType, SHAPES } from './Shape';
import {
  NORMAL_DROP_INTERVAL,
  SOFT_DROP_INTERVAL,
  SAND_SETTLE_INTERVAL,
} from './Config';

export class Game {
  private board: Board;
  public currentShape: Shape | null = null;
  public nextShape: Shape | null = null;
  public gameOver: boolean;
  public isSoftDropping: boolean;
  private isSettling: boolean; // 改为私有，只用于动画结算
  public score: number; // 新增：游戏分数

  // 计时器状态，从 main.ts 移入 Game 类
  private dropCounter: number;
  private settleCounter: number;

  constructor() {
    this.initialize();
  }

  /**
   * 游戏的主更新函数，由 main.ts 在每一帧调用
   * @param deltaTime 距离上一帧的时间差
   */
  public update(deltaTime: number): void {
    if (this.gameOver) return;

    // 只在没有“硬操作”时，才处理动画结算和自动下落
    if (this.isSettling) {
      this.settleCounter += deltaTime;
      if (this.settleCounter > SAND_SETTLE_INTERVAL) {
        this.settleSand();
        this.settleCounter = 0;
      }
    } else if (this.currentShape) {
      this.dropCounter += deltaTime;
      const currentDropInterval = this.isSoftDropping
        ? SOFT_DROP_INTERVAL
        : NORMAL_DROP_INTERVAL;

      if (this.dropCounter > currentDropInterval) {
        this.moveShapeDown();
        this.dropCounter = 0; // 关键：在下落后，立即重置计时器
      }
    }
  }

  private initialize(): void {
    this.board = new Board();
    this.gameOver = false;
    this.isSoftDropping = false;
    this.isSettling = false;
    this.currentShape = null;
    this.dropCounter = 0;
    this.settleCounter = 0;
    this.score = 0; // 初始化分数

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
    this.dropCounter = 0;

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
    } else if (this.gameOver) {
      return;
    }

    const shapeTypes = Object.keys(SHAPES) as ShapeType[];
    const randomType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    this.nextShape = new Shape(randomType);
  }

  private moveShapeDown(): void {
    if (!this.currentShape) return;
    this.currentShape.y++;
    if (this.checkCollision()) {
      this.currentShape.y--;
      if (this.currentShape.y < 0) {
        this.gameOver = true;
        return;
      }
      this.lockShape();
    }
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
    // 方块锁定后，只做一件事：启动沙盘结算模式
    this.isSettling = true;
    this.currentShape = null;
  }

  /**
   * 结算沙盘的核心逻辑，支持“连击”
   */
  private settleSand(): void {
    // 1. 先让沙粒进行一轮物理运动
    const hasMoved = this.board.updateSandStep();

    // 2. 如果没有任何沙粒可以再移动了，说明沙盘“暂时稳定”了
    if (!hasMoved) {
      // 3. 在这个稳定状态下，检查是否可以消除
      const clearedCount = this.board.clearSand();

      // 4. 如果发生了消除
      if (clearedCount > 0) {
        this.score += clearedCount; // 累加分数
        // 什么也不做，让下一次的 update() 循环自动地、再次地进入 settleSand 流程，
        // 从而让上方的沙粒落入新的空隙中，形成“连击”效果。
      } else {
        // 5. 如果既没有任何沙粒移动，也没有发生任何消除，
        //    说明沙盘已经达到了“最终稳定”状态。
        this.isSettling = false; // 结束结算模式
        this.spawnShape();     // 生成下一个方块
      }
    }
  }

  public hardDrop(): void {
    if (!this.currentShape) return;

    // 1. 瞬间计算出最终掉落位置
    while (!this.checkCollision()) {
      this.currentShape.y++;
    }
    this.currentShape.y--;

    // 2. 像正常的 lockShape 一样，将方块“印”在游戏区域上，并启动“沙盘结算”动画
    this.lockShape();
  }

  public clearBoard(): void {
    this.board = new Board();
    this.currentShape = null;
    this.spawnShape();
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

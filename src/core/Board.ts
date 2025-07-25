import { BOARD_WIDTH, BOARD_HEIGHT } from './Config';

export type Cell = string; // 用空字符串代表空格子，用颜色字符串代表有方块的格子

export class Board {
  private grid: Cell[][];

  constructor() {
    this.grid = this.createEmptyGrid();
  }

  private createEmptyGrid(): Cell[][] {
    return Array.from({ length: BOARD_HEIGHT }, () =>
      Array(BOARD_WIDTH).fill('')
    );
  }

  public getGrid(): Cell[][] {
    return this.grid;
  }

  public setCell(x: number, y: number, value: Cell): void {
    if (this.isValidPosition(x, y)) {
      this.grid[y][x] = value;
    }
  }

  public getCell(x: number, y: number): Cell | undefined {
    return this.grid[y]?.[x];
  }

  private isValidPosition(x: number, y: number): boolean {
    return x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT;
  }

  /**
   * 核心消除逻辑："流沙"消除
   * @returns 本次消除的总沙粒数量
   */
  public clearSand(): number {
    const visited = new Set<string>(); // 用于记录在本次消除中已经访问过的所有格子
    let clearedCount = 0;

    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cellColor = this.getCell(x, y);
        const key = `${x},${y}`;

        // 如果这个格子有颜色，并且我们还没有检查过它
        if (cellColor && !visited.has(key)) {
          // 就从这个格子开始，寻找所有和它相连的、同色的格子组成的团块
          const group = this.findConnectedGroup(x, y, cellColor, visited);

          // 如果这个团块同时接触到了左右两边的墙壁
          if (group.touchesLeftWall && group.touchesRightWall) {
            // 就把这个团块里的所有格子都清空
            for (const { x, y } of group.cells) {
              this.setCell(x, y, '');
            }
            clearedCount += group.cells.length;
          }
        }
      }
    }
    return clearedCount;
  }

  /**
   * 寻找并返回一个相连的、同色的格子团块
   * @param startX 起始格子的X坐标
   * @param startY 起始格子的Y坐标
   * @param color 要寻找的颜色
   * @param visited 全局访问过的格子集合，防止重复搜索
   * @returns 一个包含所有相连格子以及是否触碰墙壁信息的对象
   */
  private findConnectedGroup(
    startX: number,
    startY: number,
    color: string,
    visited: Set<string>
  ) {
    const group = {
      cells: [] as { x: number; y: number }[],
      touchesLeftWall: false,
      touchesRightWall: false,
    };

    const queue: { x: number; y: number }[] = [{ x: startX, y: startY }];
    visited.add(`${startX},${startY}`); // 标记起始格子已被访问

    while (queue.length > 0) {
      const { x, y } = queue.shift()!;

      group.cells.push({ x, y });
      if (x === 0) {
        group.touchesLeftWall = true;
      }
      if (x === BOARD_WIDTH - 1) {
        group.touchesRightWall = true;
      }

      // 对当前格子的8个方向（包括斜向）进行检查
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue; // 跳过格子自身

          const newX = x + dx;
          const newY = y + dy;
          const newKey = `${newX},${newY}`;

          // 检查邻居格子是否有效、同色，并且之前没有访问过
          if (
            this.isValidPosition(newX, newY) &&
            this.getCell(newX, newY) === color &&
            !visited.has(newKey)
          ) {
            visited.add(newKey); // 标记为已访问
            queue.push({ x: newX, y: newY }); // 加入队列，等待后续检查
          }
        }
      }
    }

    return group;
  }

  /**
   * 对整个沙盘进行一轮物理计算，让所有可移动的沙粒移动一格
   * @returns 如果在这一轮计算中，有至少一个沙粒移动了，则返回 true，否则返回 false
   */
  public updateSandStep(): boolean {
    let hasFallen = false;
    // 坚持“自底向上，自左向右”的扫描顺序
    for (let y = BOARD_HEIGHT - 2; y >= 0; y--) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = this.getCell(x, y);
        if (!cell) {
          continue; // 当前格子是空的，跳过
        }

        // --- 开始为这颗沙粒做决策 ---

        // 决策 1：垂直下落 (最高优先级)
        if (!this.getCell(x, y + 1)) {
          this.setCell(x, y + 1, cell);
          this.setCell(x, y, '');
          hasFallen = true;
          continue; // 完成移动，处理下一个沙粒
        }

        // 决策 2 & 3：斜向滑动
        // 根据您精确定义的规则，检查左右两个方向的可行性
        const canGoLeft = this.isValidPosition(x - 1, y + 1) && !this.getCell(x - 1, y + 1);
        const canGoRight =
          this.isValidPosition(x + 1, y + 1) &&
          !this.getCell(x + 1, y + 1) && // 右下方是空的
          !this.getCell(x + 1, y);      // 且正右方也是空的

        // 情况 B：如果左右两边都能滑动，随机选择一个方向
        if (canGoLeft && canGoRight) {
          const direction = Math.random() < 0.5 ? -1 : 1; // -1 代表向左, 1 代表向右
          this.setCell(x + direction, y + 1, cell);
          this.setCell(x, y, '');
          hasFallen = true;
        }
        // 情况 A：如果只能向左滑动
        else if (canGoLeft) {
          this.setCell(x - 1, y + 1, cell);
          this.setCell(x, y, '');
          hasFallen = true;
        }
        // 情况 A：如果只能向右滑动
        else if (canGoRight) {
          this.setCell(x + 1, y + 1, cell);
          this.setCell(x, y, '');
          hasFallen = true;
        }
      }
    }
    return hasFallen;
  }
}
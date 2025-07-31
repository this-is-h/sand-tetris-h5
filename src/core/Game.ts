import { Block, BLOCKS, BlockType } from './Block';
import { Board, type ClearedCell } from './Board';
import { BOARD_WIDTH, NORMAL_DROP_INTERVAL, QUICK_DROP_INTERVAL, SAND_SETTLE_INTERVAL } from './Config';

export class Game {
    private board: Board;
    public currentBlock: Block | null = null;
    public nextBlock: Block | null = null;
    public gameOver: boolean;
    public isSoftDropping: boolean;
    private isSettling: boolean; // 用于动画结算
    public score: number; // 新增：游戏分数

    // 消除事件回调，外部处理具体消除表现
    public onClear: (clearedCells: ClearedCell[]) => void = () => {};

    // 计时器状态，从 main.ts 移入 Game 类
    private dropCounter: number;
    private settleCounter: number;

    constructor() {
        this.initialize();
    }

    private initialize(): void {
        this.board = new Board();
        this.gameOver = false;
        this.isSoftDropping = false;
        this.isSettling = false;
        this.currentBlock = null;
        this.dropCounter = 0;
        this.settleCounter = 0;
        this.score = 0; // 初始化分数

        const blockTypes = Object.keys(BLOCKS) as BlockType[];
        const firstType = blockTypes[Math.floor(Math.random() * blockTypes.length)];
        this.nextBlock = new Block(firstType);
        this.spawnBlock();
    }

    private spawnBlock(): void {
        this.currentBlock = this.nextBlock;
        this.dropCounter = 0;

        if (this.currentBlock) {
            this.currentBlock.x = Math.floor(
                (BOARD_WIDTH - this.currentBlock.matrix[0].length) / 2
            );
            this.currentBlock.y = -this.currentBlock.matrix.length;

            if (this.checkCollision()) {
                this.gameOver = true;
                this.currentBlock = null;
                this.nextBlock = null;
                return;
            }
        } else if (this.gameOver) {
            return;
        }

        const blockTypes = Object.keys(BLOCKS) as BlockType[];
        const randomType = blockTypes[Math.floor(Math.random() * blockTypes.length)];
        this.nextBlock = new Block(randomType);
    }

    public getNextBlock(): Block | null {
        return this.nextBlock;
    }

    public getBoard(): Board {
        return this.board;
    }

    /**
     * 游戏的主更新函数，由 main.ts 在每一帧调用
     * @param deltaTime 距离上一帧的时间差
     */
    public update(deltaTime: number, currentTime: number): void {
        if (this.gameOver) return;

        // 只在没有“硬操作”时，才处理动画结算和自动下落
        if (this.isSettling) {
            this.settleCounter += deltaTime;
            if (this.settleCounter > SAND_SETTLE_INTERVAL) {
                this.settleSand(currentTime);
                this.settleCounter = 0;
            }
        } else if (this.currentBlock) {
            this.dropCounter += deltaTime;
            const currentDropInterval = this.isSoftDropping
                ? QUICK_DROP_INTERVAL
                : NORMAL_DROP_INTERVAL;

            if (this.dropCounter > currentDropInterval) {
                this.moveBlockDown();
                this.dropCounter = 0; // 关键：在下落后，立即重置计时器
            }
        }
    }

    private moveBlockDown(): void {
        if (!this.currentBlock) return;
        this.currentBlock.y++;
        if (this.checkCollision()) {
            this.currentBlock.y--;
            if (this.currentBlock.y < 0) {
                this.gameOver = true;
                return;
            }
            this.lockBlock();
        }
    }

    /**
     * 将当前方块锁定在沙盘上，并触发沙盘结算
     */
    private lockBlock(): void {
        if (!this.currentBlock) return;
        const { x, y, matrix, type } = this.currentBlock;
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col]) {
                    this.board.setCell(x + col, y + row, type);
                }
            }
        }

        // 方块锁定后，启动沙盘结算
        this.isSettling = true;
        this.currentBlock = null;
    }

    /**
     * 结算沙盘的核心逻辑，支持“连击”
     */
    private settleSand(currentTime: number): void {
        // 1. 先让沙粒进行一轮物理运动
        const hasMoved = this.board.updateStep();

        // 2. 如果没有任何沙粒可以再移动了，说明沙盘“暂时稳定”了
        if (!hasMoved) {
            // 3. 在这个稳定状态下，检查是否可以消除
            const clearedCells = this.board.clear();

            // 4. 如果发生了消除
            if (clearedCells.length > 0) {
                this.score += clearedCells.length; // 累加分数 TODO 简易的计分

                // 5. 处理消除集合的排序：原版的消除是有顺序的，自底向上、从左到右或者从右到左，没细研究
                // TODO 有需要自行扩展实现即可

                // // 可消除方块集合的遍历顺序：1.自底向上 2.如果最低的方块在左侧则从左到右遍历，如果最低的方块在右侧则从右往左遍历
                // const isLeftmostLower = clearedCells.some(
                //     (cell) =>
                //         cell.x === 0 &&
                //         cell.y ===
                //         Math.max(...clearedCells.map((c) => c.y))
                // );

                // if (isLeftmostLower) {
                //     // 从左到右，自底向上
                //     clearedCells.sort((a, b) =>
                //         a.y === b.y ? a.x - b.x : b.y - a.y
                //     );
                // } else {
                //     // 从右到左，自底向上
                //     clearedCells.sort((a, b) =>
                //         a.y === b.y ? b.x - a.x : b.y - a.y
                //     );
                // }

                this.onClear(clearedCells);

                // 下一次的 update() 循环会再次地进入 settleSand 流程，
                // 从而让上方的沙粒落入新的空隙中，形成“连击”效果。
            } else {
                // 6. 如果既没有任何沙粒移动，也没有发生任何消除，说明沙盘已经达到了“最终稳定”状态。
                this.isSettling = false; // 结束结算模式

                this.spawnBlock(); // 生成下一个方块
            }
        }
    }

    /**
     * 硬掉落：将当前方块直接掉落到底部
     * 1. 计算出当前方块的最终位置
     * 2. 将方块锁定在该位置，并触发沙盘结算
     */
    public hardDrop(): void {
        if (!this.currentBlock) return;

        // 1. 瞬间计算出最终掉落位置
        while (!this.checkCollision()) {
            this.currentBlock.y++;
        }
        this.currentBlock.y--; // 回到最后一个合法位置

        // 2. 将方块“印”在游戏区域上
        this.lockBlock();
    }

    /**
     * 清空游戏区域
     * 重置游戏状态，清空沙盘和当前方块
     */
    public clearBoard(): void {
        this.board = new Board();
        this.currentBlock = null;
        this.spawnBlock();
    }

    /**
     * 向左移动当前方块
     * 如果碰撞则回退
     */
    public moveBlockLeft(): void {
        if (!this.currentBlock) return;
        this.currentBlock.x--;
        if (this.checkCollision()) {
            this.currentBlock.x++;
        }
    }

    /**
     * 向右移动当前方块
     * 如果碰撞则回退
     */
    public moveBlockRight(): void {
        if (!this.currentBlock) return;
        this.currentBlock.x++;
        if (this.checkCollision()) {
            this.currentBlock.x--;
        }
    }

    /**
     * 旋转当前方块
     * 如果旋转后发生碰撞，则在旋转三次回到原位
     */
    public rotateBlock(): void {
        if (!this.currentBlock) return;
        this.currentBlock.rotate();
        if (this.checkCollision()) {
            this.currentBlock.rotate();
            this.currentBlock.rotate();
            this.currentBlock.rotate();
        }
    }

    /**
     * 检查当前方块是否与沙盘发生碰撞
     * @returns 如果发生碰撞则返回 true，否则返回 false
     */
    private checkCollision(): boolean {
        if (!this.currentBlock) return false;
        const { x, y, matrix } = this.currentBlock;
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if (matrix[row][col]) {
                    const boardX = x + col;
                    const boardY = y + row;
                    if (
                        boardX < 0 ||
                        boardX >= BOARD_WIDTH ||
                        boardY >= this.board.getGrid().length ||
                        (boardY >= 0 &&
                            this.board.getCell(boardX, boardY) !== "")
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * 开始软掉落
     * 软掉落是指在正常下落的基础上，增加了更快的下落速度
     */
    public startSoftDrop(): void {
        if (this.gameOver) return;
        this.isSoftDropping = true;
    }

    /**
     * 停止软掉落
     * 恢复到正常的下落速度
     */
    public stopSoftDrop(): void {
        if (this.gameOver) return;
        this.isSoftDropping = false;
    }

    /**
     * 设置下一个方块的类型
     * @param type 下一个方块的类型
     */
    public setNextBlock(type: BlockType): void {
        this.nextBlock = new Block(type);
    }

    /**
     * 重置游戏状态
     * 清空沙盘、当前方块和下一个方块，重新开始游戏
     */
    public reset(): void {
        this.initialize();
    }
}

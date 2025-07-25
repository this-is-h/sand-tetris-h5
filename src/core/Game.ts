import { Board } from './Board';
import { ClearEffect } from '../Effect';
import { BlockType, Block, BLOCKS } from './Block';
import { NORMAL_DROP_INTERVAL, QUICK_DROP_INTERVAL, SAND_SETTLE_INTERVAL, BOARD_WIDTH } from './Config';

export class Game {
    private board: Board;
    public currentBlock: Block | null = null;
    public nextBlock: Block | null = null;
    public gameOver: boolean;
    public isSoftDropping: boolean;
    private isSettling: boolean; // 用于动画结算
    public score: number; // 新增：游戏分数
    private activeClearEffects: ClearEffect[] = [];

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
    public update(deltaTime: number, currentTime: number): void {
        if (this.gameOver) return;

        this.updateClearEffects(currentTime);

        // 只在没有“硬操作”时，才处理动画结算和自动下落
        if (this.isSettling) {
            this.settleCounter += deltaTime;
            if (this.settleCounter > SAND_SETTLE_INTERVAL) {
                this.settleSand();
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

    public getNextBlock(): Block | null {
        return this.nextBlock;
    }

    public getBoard(): Board {
        return this.board;
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
        // 方块锁定后，只做一件事：启动沙盘结算模式
        this.isSettling = true;
        this.currentBlock = null;
    }

    /**
     * 结算沙盘的核心逻辑，支持“连击”
     */
    private settleSand(): void {
        // 1. 先让沙粒进行一轮物理运动
        const hasMoved = this.board.updateStep();

        // 2. 如果没有任何沙粒可以再移动了，说明沙盘“暂时稳定”了
        if (!hasMoved) {
            // 3. 在这个稳定状态下，检查是否可以消除
            const clearedCells = this.board.clearSand();

            // 4. 如果发生了消除
            if (clearedCells.length > 0) {
                this.score += clearedCells.length; // 累加分数
                for (const cell of clearedCells) {
                    this.activeClearEffects.push(
                        new ClearEffect(cell.x, cell.y, cell.type)
                    );
                }
                // 什么也不做，让下一次的 update() 循环自动地、再次地进入 settleSand 流程，
                // 从而让上方的沙粒落入新的空隙中，形成“连击”效果。
            } else {
                // 5. 如果既没有任何沙粒移动，也没有发生任何消除，
                //    说明沙盘已经达到了“最终稳定”状态。
                this.isSettling = false; // 结束结算模式
                this.spawnBlock(); // 生成下一个方块
            }
        }
    }

    public hardDrop(): void {
        if (!this.currentBlock) return;

        // 1. 瞬间计算出最终掉落位置
        while (!this.checkCollision()) {
            this.currentBlock.y++;
        }
        this.currentBlock.y--;

        // 2. 像正常的 lockBlock 一样，将方块“印”在游戏区域上，并启动“沙盘结算”动画
        this.lockBlock();
    }

    public clearBoard(): void {
        this.board = new Board();
        this.currentBlock = null;
        this.spawnBlock();
    }

    public moveBlockLeft(): void {
        if (!this.currentBlock) return;
        this.currentBlock.x--;
        if (this.checkCollision()) {
            this.currentBlock.x++;
        }
    }

    public moveBlockRight(): void {
        if (!this.currentBlock) return;
        this.currentBlock.x++;
        if (this.checkCollision()) {
            this.currentBlock.x--;
        }
    }

    public rotateBlock(): void {
        if (!this.currentBlock) return;
        this.currentBlock.rotate();
        if (this.checkCollision()) {
            this.currentBlock.rotate();
            this.currentBlock.rotate();
            this.currentBlock.rotate();
        }
    }

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

    public startSoftDrop(): void {
        if (this.gameOver) return;
        this.isSoftDropping = true;
    }

    public stopSoftDrop(): void {
        if (this.gameOver) return;
        this.isSoftDropping = false;
    }

    public setNextBlock(type: Exclude<BlockType, "">): void {
        this.nextBlock = new Block(type);
    }

    public reset(): void {
        this.initialize();
    }

    public getActiveClearEffects(): ClearEffect[] {
        return this.activeClearEffects;
    }

    private updateClearEffects(currentTime: number): void {
        this.activeClearEffects = this.activeClearEffects.filter((effect) =>
            effect.update(currentTime)
        );
    }
}

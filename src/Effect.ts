import { CLEAR_ANIMATION_WHITE_DURATION } from './core/Config';
import { type BlockType } from './core/Block';

/**
 * 消除效果在这个demo不是重点，随便的实现有得看就行
 */
export class ClearEffect {
    x: number;
    y: number;
    initialType: BlockType; // 保留，以防未来需要
    startTime: number;

    constructor(x: number, y: number, type: BlockType, currentTime: number) {
        this.x = x;
        this.y = y;
        this.initialType = type;
        this.startTime = currentTime; // 使用传入的时间戳
    }

    /**
     * 更新动画状态。
     * 动画只持续一个“闪白”阶段。
     * @param currentTime 当前时间
     * @returns 如果动画仍在进行中，返回 true，否则返回 false。
     */
    public update(currentTime: number): boolean {
        const elapsedTime = currentTime - this.startTime;
        // 动画只持续“闪白”的设定的时间
        return elapsedTime < CLEAR_ANIMATION_WHITE_DURATION;
    }

    /**
     * 绘制效果。
     * 在动画持续期间，只在指定位置绘制一个纯白色的方块。
     * @param context Canvas 2D 上下文
     * @param cellSize 格子大小
     */
    public draw(
        context: CanvasRenderingContext2D,
        cellSize: number
    ): void {
        context.fillStyle = 'white';
        context.fillRect(
            this.x * cellSize,
            this.y * cellSize,
            cellSize,
            cellSize
        );
    }
}
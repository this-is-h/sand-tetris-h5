import { CLEAR_ANIMATION_WHITE_DURATION, CLEAR_ANIMATION_FADE_DURATION } from './core/Config';

export class ClearEffect {
  x: number;
  y: number;
  initialColor: string;
  startTime: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.initialColor = color;
    this.startTime = Date.now();
  }

  public update(currentTime: number): boolean {
    const elapsedTime = currentTime - this.startTime;

    // 动画第一阶段：变成纯白色
    if (elapsedTime < CLEAR_ANIMATION_WHITE_DURATION) {
      return true; // 动画进行中
    }

    // 动画第二阶段：渐变到透明并缩小
    const fadeStartTime = this.startTime + CLEAR_ANIMATION_WHITE_DURATION;
    const fadeElapsedTime = currentTime - fadeStartTime;

    if (fadeElapsedTime < CLEAR_ANIMATION_FADE_DURATION) {
      return true; // 动画进行中
    }

    return false; // 动画结束
  }

  public draw(context: CanvasRenderingContext2D, cellSize: number, currentTime: number): void {
    const elapsedTime = currentTime - this.startTime;

    if (elapsedTime < CLEAR_ANIMATION_WHITE_DURATION) {
      // 第一阶段：纯白色
      context.fillStyle = 'white';
      context.fillRect(this.x * cellSize, this.y * cellSize, cellSize, cellSize);
    } else {
      // 第二阶段：渐变和缩小
      const fadeStartTime = this.startTime + CLEAR_ANIMATION_WHITE_DURATION;
      const fadeElapsedTime = currentTime - fadeStartTime;
      const progress = Math.min(fadeElapsedTime / CLEAR_ANIMATION_FADE_DURATION, 1);

      // 透明度渐变
      const alpha = 1 - progress;
      context.fillStyle = `rgba(255, 255, 255, ${alpha})`; // 从白色渐变透明

      // 大小缩放
      const scale = 1 - progress;
      const scaledSize = cellSize * scale;
      const offset = (cellSize - scaledSize) / 2;

      context.fillRect(
        this.x * cellSize + offset,
        this.y * cellSize + offset,
        scaledSize,
        scaledSize
      );
    }
  }
}
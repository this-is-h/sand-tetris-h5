// src/config.ts

/**
 * 缩放因子
 * 这个值决定了 "Sand Blast" 版本的俄罗斯方块相对于原版被放大了多少倍。
 * 例如，值为 7 意味着原版中 2x2 的 O 形方块，在 Sand Blast 中会变成 14x14 的大方块。
 */
export const SCALE_FACTOR = 7;

/**
 * 基础的游戏区域尺寸（以原版俄罗斯方块的格子为单位）
 */
export const BASE_BOARD_WIDTH = 10;
export const BASE_BOARD_HEIGHT = 20;

/**
 * 方块正常自动下落的时间间隔（单位：毫秒）
 */
export const NORMAL_DROP_INTERVAL = 50;

/**
 * 玩家按住"向下"键时，方块的快速下落时间间隔（单位：毫秒）
 */
export const SOFT_DROP_INTERVAL = 1;

/**
 * 沙粒物理演算的时间间隔（单位：毫秒）
 * 这个值越小，沙粒下落和滑动看起来就越流畅、越快
 */
export const SAND_SETTLE_INTERVAL = 5;
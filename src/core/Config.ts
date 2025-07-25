/**
 * 缩放因子
 * 这个值决定了 "Sand Blast" 版本的俄罗斯方块相对于原版被放大了多少倍。
 * 例如，值为 7 意味着原版中 2x2 的 O 形方块，在 Sand Blast 中会变成 14x14 的大方块。
 */
export const SCALE_FACTOR = 7;

/**
 * 基础的游戏区域尺寸（以正常俄罗斯方块的格子为单位）
 */
const BASE_BOARD_WIDTH = 12;
const BASE_BOARD_HEIGHT = 18;

/**
 * 游戏区域的宽度和高度
 * 通过将基础尺寸乘以缩放因子来计算
 */
export const BOARD_WIDTH = BASE_BOARD_WIDTH * SCALE_FACTOR;
export const BOARD_HEIGHT = BASE_BOARD_HEIGHT * SCALE_FACTOR;

/**
 * 方块正常自动下落的时间间隔（单位：毫秒）
 */
export const NORMAL_DROP_INTERVAL = 50;

/**
 * 玩家按住"向下"键时，方块的快速下落时间间隔（单位：毫秒）
 */
export const QUICK_DROP_INTERVAL = 0;

/**
 * 沙粒物理演算的时间间隔（单位：毫秒）
 * 这个值越小，沙粒下落和滑动看起来就越流畅、越快
 */
export const SAND_SETTLE_INTERVAL = 5;

/**
 * 消除动画：方块变成纯白色的持续时间（单位：毫秒）
 */
export const CLEAR_ANIMATION_WHITE_DURATION = 100;

/**
 * 消除动画：方块从白色渐变到透明并缩小的持续时间（单位：毫秒）
 */
export const CLEAR_ANIMATION_FADE_DURATION = 200;

/**
 * 旋转操作的冷却时间（单位：毫秒），防止长按连续旋转
 */
export const ROTATE_COOLDOWN = 200;
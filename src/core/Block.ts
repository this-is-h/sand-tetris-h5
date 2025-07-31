import { SCALE_FACTOR } from './Config';

/**
 * 方块类型枚举
 */
export const enum BlockType {
    I = 1,
    L = 2,
    J = 3,
    S = 4,
    Z = 5,
    T = 6,
    O = 7,
}

/**
 * 定义颜色类型枚举
 * 使用字符串为了便于扩展单个格子数据，比如：1_x_y，x和y可以表示方块的其他属性
 */
export const enum ColorType {
    c1 = "1",
    c2 = "2",
    c3 = "3",
    c4 = "4",
    c5 = "5",
    c6 = "6",
    c7 = "7",
}

// 定义沙盘格子的颜色值
export const ColorHex = {
    [ColorType.c1]: '#40E0D0',
    [ColorType.c2]: '#E69138',
    [ColorType.c3]: '#6495ED',
    [ColorType.c4]: '#98FB98',
    [ColorType.c5]: '#FF6B6B',
    [ColorType.c6]: '#BA55D3',
    [ColorType.c7]: '#F0E68C',
}

// 定义方块信息
export type IBlockInfo = number[][]; // 形状矩阵

// 配置所有方块矩阵信息
export const BLOCKS: { [key in BlockType]: IBlockInfo } = {
    [BlockType.I]:
        [
            [1, 1, 1, 1]
        ],
    [BlockType.L]:
        [
            [0, 0, 1],
            [1, 1, 1]
        ],
    [BlockType.J]:
        [
            [1, 0, 0],
            [1, 1, 1],
        ],
    [BlockType.S]: [
        [0, 1, 1],
        [1, 1, 0],
    ],
    [BlockType.Z]: [
        [1, 1, 0],
        [0, 1, 1],
    ],
    [BlockType.T]: [
        [0, 1, 0],
        [1, 1, 1],
    ],
    [BlockType.O]: [
        [1, 1],
        [1, 1],
    ]
};

/**
 * 方块类
 * 表示游戏中的一个方块，包含其位置、形状矩阵和类型
 * 可以通过旋转方法改变其形状矩阵
 * 
 * （为了支持原版俄罗斯方块的旋转引入这个类，如果不需要旋转功能则完全不需要多这个类包装，游戏实现会少很多代码）
 */
export class Block {
    public x: number;
    public y: number;
    public matrix: number[][];
    public type: BlockType;
    public color: ColorType;

    constructor(type: BlockType, color: ColorType) {
        const block: IBlockInfo = BLOCKS[type];
        this.x = 0;
        this.y = 0;
        this.matrix = this.createScaledMatrix(block);
        this.type = type;
        this.color = color;
    }

    /**
     * 根据缩放因子，将基础矩阵放大成由小沙粒组成的大矩阵
     * @param baseMatrix 基础的形状矩阵，例如 [[1, 1], [1, 1]]
     * @returns 一个被放大了的、代表沙粒的新矩阵
     */
    private createScaledMatrix(baseMatrix: number[][]): number[][] {
        const scaledMatrix: number[][] = [];
        for (let r = 0; r < baseMatrix.length * SCALE_FACTOR; r++) {
            scaledMatrix[r] = [];
            for (let c = 0; c < baseMatrix[0].length * SCALE_FACTOR; c++) {
                // 通过 floor(r / factor) 和 floor(c / factor) 找到其在基础矩阵中对应的位置
                const baseRow = Math.floor(r / SCALE_FACTOR);
                const baseCol = Math.floor(c / SCALE_FACTOR);
                scaledMatrix[r][c] = baseMatrix[baseRow][baseCol];
            }
        }
        return scaledMatrix;
    }

    /**
     * 旋转方块
     * 将方块的形状矩阵进行顺时针旋转90度
     */
    public rotate(): void {
        const newMatrix: number[][] = [];
        for (let i = 0; i < this.matrix[0].length; i++) {
            newMatrix[i] = [];
            for (let j = 0; j < this.matrix.length; j++) {
                newMatrix[i][j] = this.matrix[this.matrix.length - 1 - j][i];
            }
        }
        this.matrix = newMatrix;
    }
}

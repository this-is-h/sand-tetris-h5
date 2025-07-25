import { SCALE_FACTOR } from './Config';

/**
 * 方块类型枚举
 * 使用数字字符串以节省内存，并作为索引映射到颜色
 */
export const enum BlockType {
    I = '1',
    L = '2',
    J = '3',
    S = '4',
    Z = '5',
    T = '6',
    O = '7',
}

// 定义“形状信息”
export interface IBlockInfo {
    matrix: number[][];
    color: string;
}


export const BLOCKS: { [key in BlockType]: IBlockInfo } = {
    [BlockType.I]: {
        matrix: [[1, 1, 1, 1]],
        color: '#40E0D0'
    },
    [BlockType.L]: {
        matrix: [
            [0, 0, 1],
            [1, 1, 1],
        ],
        color: '#E69138'
    },
    [BlockType.J]: {
        matrix: [
            [1, 0, 0],
            [1, 1, 1],
        ],
        color: '#6495ED'
    },
    [BlockType.S]: {
        matrix: [
            [0, 1, 1],
            [1, 1, 0],
        ],
        color: '#98FB98'
    },
    [BlockType.Z]: {
        matrix: [
            [1, 1, 0],
            [0, 1, 1],
        ],
        color: '#FF6B6B'
    },
    [BlockType.T]: {
        matrix: [
            [0, 1, 0],
            [1, 1, 1],
        ],
        color: '#BA55D3'
    },
    [BlockType.O]: {
        matrix: [
            [1, 1],
            [1, 1],
        ],
        color: '#F0E68C'
    },
};

export class Block {
    public x: number;
    public y: number;
    public matrix: number[][];
    public type: BlockType;

    constructor(type: BlockType) {
        const block: IBlockInfo = BLOCKS[type];
        this.x = 0;
        this.y = 0;
        this.matrix = this.createScaledMatrix(block.matrix);
        this.type = type;
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

import { Game } from './core/Game';
import { Renderer } from './Renderer';
import { InputHandler } from './InputHandler';
import { DebugMenu } from './Debug';
import { ClearEffect } from './Effect';

let game: Game;
let renderer: Renderer;
let activeClearEffects: ClearEffect[] = [];

document.addEventListener('DOMContentLoaded', () => {
    game = new Game();
    renderer = new Renderer('game-canvas', 'next-block-canvas', 'score-value');
    new InputHandler(game);
    new DebugMenu(game);

    game.onClear = (clearedCells) => {
        const currentTime = performance.now();
        for (const cell of clearedCells) {
            activeClearEffects.push(
                new ClearEffect(cell.x, cell.y, currentTime)
            );
        }
    };

    let lastTime = 0;

    function gameLoop(timestamp: number) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        // 1. 更新游戏世界的所有状态
        game.update(deltaTime, timestamp);
        activeClearEffects = activeClearEffects.filter((effect) =>
            effect.update(timestamp)
        );

        // 2. 根据游戏世界的当前状态，渲染画面
        renderer.render(
            game,
            game.currentBlock,
            game.getNextBlock(),
            game.gameOver,
            game.score,
            activeClearEffects
        );

        requestAnimationFrame(gameLoop);
    }

    // 启动游戏循环
    requestAnimationFrame(gameLoop);
});

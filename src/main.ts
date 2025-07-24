import { Game } from './Game';
import { Renderer } from './Renderer';
import { InputHandler } from './InputHandler';
import { DebugMenu } from './Debug';

const game = new Game();
const renderer = new Renderer('game-canvas', 'next-shape-canvas');
new InputHandler(game);
new DebugMenu(game);

let lastTime = 0;

function gameLoop(timestamp: number) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // 1. 更新游戏世界的所有状态
  game.update(deltaTime);

  // 2. 根据游戏世界的当前状态，渲染画面
  renderer.render(
    game.getBoard(),
    game.currentShape,
    game.getNextShape(),
    game.gameOver
  );

  requestAnimationFrame(gameLoop);
}

// 启动游戏循环
requestAnimationFrame(gameLoop);
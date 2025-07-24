import { Game } from './Game';
import { Renderer } from './Renderer';
import { InputHandler } from './InputHandler';
import { DebugMenu } from './Debug'; // 引入调试菜单
import { NORMAL_DROP_INTERVAL, SOFT_DROP_INTERVAL } from './config';

const game = new Game();
const renderer = new Renderer('game-canvas', 'next-shape-canvas');
new InputHandler(game);
new DebugMenu(game); // 实例化调试菜单

let dropCounter = 0;
let lastTime = 0;

function gameLoop(timestamp: number) {
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  if (game.gameOver) {
    renderer.render(game.getBoard(), game.currentShape, game.getNextShape(), game.gameOver);
    return;
  }

  dropCounter += deltaTime;

  const currentDropInterval = game.isSoftDropping
    ? SOFT_DROP_INTERVAL
    : NORMAL_DROP_INTERVAL;

  if (dropCounter > currentDropInterval) {
    game.moveShapeDown();
    dropCounter = 0;
  }

  renderer.render(game.getBoard(), game.currentShape, game.getNextShape(), game.gameOver);

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);

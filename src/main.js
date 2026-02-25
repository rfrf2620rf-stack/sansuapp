/**
 * main.js - Make-10 エントリーポイント
 * 全モジュールを統合し、ゲームループを管理
 */
import { initPhysics, stepPhysics, getEngine, getWorld, resizePhysics } from './engine/physics.js';
import { initRenderer, drawBackground, drawSlime, drawDragLine, getCanvasSize } from './engine/renderer.js';
import { initInput, getDragState } from './engine/input.js';
import { initCollision, onMerge } from './game/collision.js';
import { updateEffects, drawEffects, updateBodyShakes } from './game/effects.js';
import { showMenu, hideMenu, setCurrentLevel, getCurrentLevel, showMessage } from './levels/levelManager.js';
import { startLevel1, onLevel1Merge, updateLevel1, cleanupLevel1, getLevel1RoundInfo } from './levels/level1.js';
import { startLevel2, onLevel2Merge, updateLevel2, cleanupLevel2 } from './levels/level2.js';
import { startLevel3, onLevel3Merge, updateLevel3, cleanupLevel3 } from './levels/level3.js';
import { resumeAudio } from './utils/audio.js';

// ===== Initialization =====
const canvas = document.getElementById('game-canvas');
const { width, height } = getCanvasSize();

// Init subsystems
initRenderer(canvas);
const { engine } = initPhysics(width, height);
initInput(canvas, () => getWorld().bodies);
initCollision(engine);

// ===== Merge callback =====
onMerge((numA, numB, mx, my) => {
  const level = getCurrentLevel();
  if (level === 1) onLevel1Merge(numA, numB);
  else if (level === 2) onLevel2Merge(numA, numB);
  else if (level === 3) onLevel3Merge(numA, numB);
});

// ===== Menu buttons =====
document.querySelectorAll('.level-btn').forEach(btn => {
  const handler = (e) => {
    e.preventDefault();
    resumeAudio();
    const level = parseInt(btn.dataset.level, 10);
    if (btn.classList.contains('locked')) return;
    startGame(level);
  };
  btn.addEventListener('click', handler);
  btn.addEventListener('touchstart', handler, { passive: false });
});

/** Start a specific level */
function startGame(level) {
  hideMenu();
  setCurrentLevel(level);
  const { width, height } = getCanvasSize();

  if (level === 1) {
    startLevel1(width, height, () => {
      showMessage('🎉 Clear!', 2000);
      setTimeout(() => {
        cleanupLevel1();
        showMenu();
      }, 2500);
    });
  } else if (level === 2) {
    startLevel2(width, height, () => {
      showMessage('Game Over', 2000);
      setTimeout(() => {
        cleanupLevel2();
        showMenu();
      }, 2500);
    });
  } else if (level === 3) {
    startLevel3(width, height, () => {
      showMessage('🎉 Clear!', 2000);
      setTimeout(() => {
        cleanupLevel3();
        showMenu();
      }, 2500);
    });
  }
}

// ===== Window resize =====
window.addEventListener('resize', () => {
  const { width, height } = getCanvasSize();
  resizePhysics(width, height);
});

// ===== Game Loop =====
let lastTime = performance.now();

function gameLoop(time) {
  const dt = Math.min(time - lastTime, 32); // Cap at ~30fps minimum
  lastTime = time;

  // Physics step
  stepPhysics(dt);

  // Level-specific updates
  const level = getCurrentLevel();
  if (level === 1) updateLevel1(time);
  else if (level === 2) updateLevel2(time);
  else if (level === 3) updateLevel3(time);

  // Update effects
  updateEffects();
  updateBodyShakes(getWorld().bodies);

  // ===== Render =====
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  // Clear and draw background
  drawBackground();

  // Draw all slime bodies
  for (const body of getWorld().bodies) {
    if (body.slimeNumber) {
      drawSlime(body, time);
    }
  }

  // Draw drag indicator
  const drag = getDragState();
  if (drag) {
    drawDragLine(drag.body.position.x, drag.body.position.y, drag.currentX, drag.currentY);
  }

  // Draw effects on top
  drawEffects(ctx);

  requestAnimationFrame(gameLoop);
}

// Start!
showMenu();
requestAnimationFrame(gameLoop);

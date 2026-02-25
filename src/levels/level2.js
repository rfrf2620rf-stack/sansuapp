/**
 * level2.js - Lv.2 落ち物パズルモード
 * 上から数字が落下、下のボタンで補数を発射して空中で10にする
 */
import { createSlime } from '../game/slime.js';
import { clearBodies, getWorld, Body, removeBody } from '../engine/physics.js';
import { LEVEL2, SLIME_CONFIG } from '../utils/constants.js';
import { playClearSound, playTapSound } from '../utils/audio.js';
import { resetScore, addMergeScore, showScore, saveHighScore } from '../game/score.js';

let fallingSlime = null;
let bulletSlime = null;
let lives = 3;
let isActive = false;
let onCompleteCallback = null;
let buttonContainer = null;
let mergeCount = 0;
const MAX_MERGES = 15; // Clear after 15 successful merges

/** Start Level 2 */
export function startLevel2(width, height, onComplete) {
  onCompleteCallback = onComplete;
  lives = 3;
  mergeCount = 0;
  isActive = true;
  resetScore();
  showScore(true);

  // Create/show shooter buttons
  setupButtons(width, height);

  // Start spawning after short delay
  setTimeout(() => spawnFallingSlime(width), 500);
}

/** Setup bottom buttons */
function setupButtons(width, height) {
  buttonContainer = document.getElementById('shooter-buttons');
  if (!buttonContainer) {
    buttonContainer = document.createElement('div');
    buttonContainer.id = 'shooter-buttons';
    document.body.appendChild(buttonContainer);
  }
  buttonContainer.classList.add('visible');
}

/** Spawn a falling number from the top */
function spawnFallingSlime(width) {
  if (!isActive) return;

  // Random number 1-9
  const num = Math.floor(Math.random() * 9) + 1;
  const x = 100 + Math.random() * (width - 200);

  // Spawn just inside the screen (top wall is at y ~ -30)
  fallingSlime = createSlime(num, x, 10);

  // IMPORTANT: Clear spawn immunity so falling slime can merge with bullet
  fallingSlime.spawnImmunity = 0;

  // Disable air friction for smooth falling
  fallingSlime.frictionAir = 0;

  // Give it a constant downward velocity
  Body.setVelocity(fallingSlime, { x: 0, y: 2 });

  // Generate button options (always include the correct answer)
  generateButtons(num, width);
}

/** Generate button numbers (1 correct + 3 random) */
function generateButtons(fallingNum, width) {
  const correct = 10 - fallingNum;
  const options = [correct];

  while (options.length < LEVEL2.buttonCount) {
    const r = Math.floor(Math.random() * 9) + 1;
    if (!options.includes(r)) {
      options.push(r);
    }
  }

  // Shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  // Render buttons
  buttonContainer.innerHTML = '';
  options.forEach(num => {
    const btn = document.createElement('button');
    btn.className = 'shoot-btn';
    btn.textContent = num;
    btn.style.borderColor = SLIME_CONFIG[num]?.color || '#fff';
    const handler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      shootBullet(num, width);
    };
    btn.addEventListener('click', handler);
    btn.addEventListener('touchstart', handler, { passive: false });
    buttonContainer.appendChild(btn);
  });
}

/** Shoot a bullet upward */
function shootBullet(num, width) {
  if (bulletSlime || !fallingSlime) return;

  playTapSound();

  // Create bullet at bottom center, aimed at falling slime
  const targetX = fallingSlime.position.x;
  const x = window.innerWidth / 2;
  const y = window.innerHeight - 120;

  bulletSlime = createSlime(num, x, y);
  // Clear spawn immunity for bullet too
  bulletSlime.spawnImmunity = 0;

  // Calculate direction toward falling slime
  const dx = targetX - x;
  const dy = fallingSlime.position.y - y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const speed = 14;
  Body.setVelocity(bulletSlime, {
    x: (dx / dist) * speed,
    y: (dy / dist) * speed
  });
}

/** Update Level 2 per frame */
export function updateLevel2(time) {
  if (!isActive) return;

  // Keep falling slime moving downward (override physics drift)
  if (fallingSlime && getWorld().bodies.includes(fallingSlime)) {
    // Maintain downward velocity (gravity is very low globally)
    const vy = fallingSlime.velocity.y;
    if (vy < 2) {
      Body.setVelocity(fallingSlime, {
        x: fallingSlime.velocity.x * 0.95,
        y: Math.max(vy, 2)
      });
    }

    // Check if falling slime hit the ground
    if (fallingSlime.position.y > window.innerHeight * LEVEL2.groundY) {
      // Miss! Remove and lose a life
      removeBody(fallingSlime);
      fallingSlime = null;
      lives--;

      // Remove any stale bullet
      if (bulletSlime) {
        removeBody(bulletSlime);
        bulletSlime = null;
      }

      if (lives <= 0) {
        // Game over
        isActive = false;
        saveHighScore(2);
        if (onCompleteCallback) {
          setTimeout(() => onCompleteCallback(), 1500);
        }
      } else {
        // Next slime
        setTimeout(() => spawnFallingSlime(window.innerWidth), 800);
      }
    }
  }

  // Remove bullet if it goes off screen
  if (bulletSlime) {
    if (bulletSlime.position.y < -100 ||
        bulletSlime.position.y > window.innerHeight + 100 ||
        bulletSlime.position.x < -100 ||
        bulletSlime.position.x > window.innerWidth + 100) {
      removeBody(bulletSlime);
      bulletSlime = null;
    }
  }
}

/** Called when slimes merge in Level 2 */
export function onLevel2Merge(numA, numB) {
  addMergeScore();
  fallingSlime = null;
  bulletSlime = null;
  mergeCount++;

  if (mergeCount >= MAX_MERGES) {
    // Level clear!
    isActive = false;
    playClearSound();
    saveHighScore(2);
    if (onCompleteCallback) {
      setTimeout(() => onCompleteCallback(), 1500);
    }
  } else {
    // Spawn next after brief delay
    setTimeout(() => {
      spawnFallingSlime(window.innerWidth);
    }, 1000);
  }
}

/** Cleanup Level 2 */
export function cleanupLevel2() {
  isActive = false;
  clearBodies();
  fallingSlime = null;
  bulletSlime = null;
  if (buttonContainer) {
    buttonContainer.classList.remove('visible');
    buttonContainer.innerHTML = '';
  }
  showScore(false);
}

/** Get Level 2 state */
export function getLevel2State() {
  return { lives, isActive, mergeCount };
}

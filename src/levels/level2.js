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
let spawnTimer = null;
let lives = 3;
let score = 0;
let isActive = false;
let onCompleteCallback = null;
let buttonContainer = null;

/** Start Level 2 */
export function startLevel2(width, height, onComplete) {
  onCompleteCallback = onComplete;
  lives = 3;
  isActive = true;
  resetScore();
  showScore(true);

  // Create/show shooter buttons
  setupButtons(width, height);

  // Start spawning
  spawnFallingSlime(width);
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

  fallingSlime = createSlime(num, x, -50);
  Body.setVelocity(fallingSlime, { x: 0, y: LEVEL2.fallSpeed });

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
    btn.addEventListener('click', () => shootBullet(num, width));
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      shootBullet(num, width);
    }, { passive: false });
    buttonContainer.appendChild(btn);
  });
}

/** Shoot a bullet upward */
function shootBullet(num, width) {
  if (bulletSlime || !fallingSlime) return;

  playTapSound();

  // Create bullet at bottom center
  const x = window.innerWidth / 2;
  const y = window.innerHeight - 100;
  bulletSlime = createSlime(num, x, y);
  Body.setVelocity(bulletSlime, { x: 0, y: -12 });
}

/** Update Level 2 per frame */
export function updateLevel2(time) {
  if (!isActive) return;

  // Check if falling slime hit the ground
  if (fallingSlime && fallingSlime.position.y > window.innerHeight * LEVEL2.groundY) {
    // Miss! Remove and lose a life
    removeBody(fallingSlime);
    fallingSlime = null;
    lives--;

    if (lives <= 0) {
      // Game over
      isActive = false;
      saveHighScore(2);
      if (onCompleteCallback) {
        setTimeout(() => onCompleteCallback(), 1500);
      }
    } else {
      // Next slime
      setTimeout(() => spawnFallingSlime(window.innerWidth), 1000);
    }
  }

  // Remove bullet if it goes off screen
  if (bulletSlime && bulletSlime.position.y < -50) {
    removeBody(bulletSlime);
    bulletSlime = null;
  }
}

/** Called when slimes merge in Level 2 */
export function onLevel2Merge(numA, numB) {
  addMergeScore();
  fallingSlime = null;
  bulletSlime = null;

  // Spawn next after delay
  setTimeout(() => {
    spawnFallingSlime(window.innerWidth);
  }, LEVEL2.spawnInterval / 3);
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
  return { lives, isActive };
}

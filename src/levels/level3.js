/**
 * level3.js - Lv.3 忍者モード
 * 数字が数秒後に「？」に変化、5秒おきにチラッと再表示される
 */
import { createSlimePairs, generateRandomPairs } from '../game/slime.js';
import { clearBodies, getWorld, Body } from '../engine/physics.js';
import { LEVEL3, PHYSICS } from '../utils/constants.js';
import { playClearSound, playTapSound } from '../utils/audio.js';
import { resetScore, addMergeScore, showScore, saveHighScore } from '../game/score.js';

let slimes = [];
let onCompleteCallback = null;
let roundCount = 0;
let maxRounds = 5;
let floatTimer = 0;
let revealInterval = null;
let hideTimeout = null;

/** Start Level 3 */
export function startLevel3(width, height, onComplete) {
  roundCount = 0;
  onCompleteCallback = onComplete;
  resetScore();
  showScore(true);
  spawnNinjaRound(width, height);
}

/** Spawn a round with hiding numbers */
function spawnNinjaRound(width, height) {
  clearBodies();
  slimes = [];
  clearTimers();

  const pairCount = Math.min(2 + roundCount, 5);
  const pairs = generateRandomPairs(pairCount);
  slimes = createSlimePairs(pairs, width, height);

  // Initially show the numbers for 3 seconds
  for (const body of slimes) {
    body.hiddenNumber = false;
  }

  // After initial reveal, hide them
  hideTimeout = setTimeout(() => {
    hideAllNumbers();
    // Start periodic reveal cycle: every 5 seconds, briefly show numbers for 1.5 seconds
    startPeriodicReveal();
  }, LEVEL3.revealDuration);
}

/** Hide all numbers */
function hideAllNumbers() {
  for (const body of slimes) {
    if (getWorld().bodies.includes(body)) {
      body.hiddenNumber = true;
    }
  }
}

/** Show all numbers temporarily */
function revealAllNumbers() {
  for (const body of slimes) {
    if (getWorld().bodies.includes(body)) {
      body.hiddenNumber = false;
    }
  }
  playTapSound(); // Subtle sound cue when numbers appear
}

/** Start the periodic reveal cycle */
function startPeriodicReveal() {
  clearInterval(revealInterval);
  revealInterval = setInterval(() => {
    // Only reveal if there are still active slimes
    const active = slimes.filter(s => getWorld().bodies.includes(s));
    if (active.length <= 0) {
      clearTimers();
      return;
    }

    // Flash: show numbers for 1.5 seconds
    revealAllNumbers();
    hideTimeout = setTimeout(() => {
      hideAllNumbers();
    }, 1500);
  }, 5000); // Every 5 seconds
}

/** Clear all timers */
function clearTimers() {
  if (revealInterval) {
    clearInterval(revealInterval);
    revealInterval = null;
  }
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
}

/** Called when two slimes merge in Level 3 */
export function onLevel3Merge(numA, numB) {
  addMergeScore();
  slimes = slimes.filter(s => getWorld().bodies.includes(s));

  const remaining = slimes.filter(s => s.slimeNumber);
  if (remaining.length <= 0) {
    clearTimers();
    roundCount++;
    if (roundCount >= maxRounds) {
      playClearSound();
      saveHighScore(3);
      if (onCompleteCallback) {
        setTimeout(() => onCompleteCallback(), 1500);
      }
    } else {
      playClearSound();
      setTimeout(() => {
        spawnNinjaRound(window.innerWidth, window.innerHeight);
      }, 1000);
    }
  }
}

/** Update Level 3 per frame */
export function updateLevel3(time) {
  floatTimer += 1;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight * 0.4;

  for (const body of slimes) {
    if (!body.slimeNumber || body.isStatic) continue;
    if (!getWorld().bodies.includes(body)) continue;

    const fx = Math.sin(floatTimer * 0.015 + body.id * 2.3) * PHYSICS.floatForce;
    const fy = Math.cos(floatTimer * 0.012 + body.id * 1.7) * PHYSICS.floatForce;

    const dx = centerX - body.position.x;
    const dy = centerY - body.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const pullStrength = 0.000015 * Math.max(0, dist - 100);
    const pullX = (dx / (dist || 1)) * pullStrength;
    const pullY = (dy / (dist || 1)) * pullStrength;

    Body.applyForce(body, body.position, { x: fx + pullX, y: fy + pullY });

    const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    if (speed > 4) {
      Body.setVelocity(body, {
        x: body.velocity.x * 0.92,
        y: body.velocity.y * 0.92,
      });
    }
  }
}

/** Get active slimes */
export function getLevel3Slimes() {
  return slimes;
}

/** Cleanup Level 3 */
export function cleanupLevel3() {
  clearTimers();
  clearBodies();
  slimes = [];
  showScore(false);
}

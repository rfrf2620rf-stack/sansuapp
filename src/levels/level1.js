/**
 * level1.js - Lv.1 チュートリアル「ピッタリ10を作ろう」
 * ペアになる数字がフワフワ浮いている。合体させて10を作る。
 */
import { createSlimePairs, generateRandomPairs } from '../game/slime.js';
import { clearBodies, getWorld, Body } from '../engine/physics.js';
import { LEVEL1_ROUNDS, PHYSICS } from '../utils/constants.js';
import { playClearSound } from '../utils/audio.js';
import { resetScore, addMergeScore, showScore, saveHighScore } from '../game/score.js';

let currentRound = 0;
let slimes = [];
let onCompleteCallback = null;
let floatTimer = 0;

/** Start Level 1 */
export function startLevel1(width, height, onComplete) {
  currentRound = 0;
  onCompleteCallback = onComplete;
  resetScore();
  showScore(true);
  spawnRound(width, height);
}

/** Spawn current round */
function spawnRound(width, height) {
  clearBodies();
  slimes = [];

  const roundData = LEVEL1_ROUNDS[currentRound];
  let pairs;

  if (roundData === 'random') {
    pairs = generateRandomPairs(4);
  } else {
    pairs = roundData;
  }

  slimes = createSlimePairs(pairs, width, height);
}

/** Called when two slimes are merged */
export function onLevel1Merge(numA, numB) {
  const result = addMergeScore();

  // Remove merged slimes from tracking
  slimes = slimes.filter(s => !s.isRemoved && getWorld().bodies.includes(s));

  // Check remaining slimes (only count active slime bodies)
  const remaining = slimes.filter(s => s.slimeNumber);

  if (remaining.length <= 0) {
    // Round clear!
    currentRound++;
    if (currentRound >= LEVEL1_ROUNDS.length) {
      // Level complete!
      playClearSound();
      saveHighScore(1);
      if (onCompleteCallback) {
        setTimeout(() => onCompleteCallback(), 1500);
      }
    } else {
      // Next round after brief pause
      playClearSound();
      setTimeout(() => {
        spawnRound(window.innerWidth, window.innerHeight);
      }, 1000);
    }
  }
}

/** Update floating behavior per frame */
export function updateLevel1(time) {
  floatTimer += 1;

  // Apply gentle random forces to make slimes float
  for (const body of slimes) {
    if (!body.slimeNumber || body.isStatic) continue;
    if (!getWorld().bodies.includes(body)) continue;

    // Gentle upward drift
    const fx = Math.sin(floatTimer * 0.02 + body.id * 2.3) * PHYSICS.floatForce;
    const fy = -Math.abs(Math.cos(floatTimer * 0.015 + body.id * 1.7)) * PHYSICS.floatForce * 1.5;
    Body.applyForce(body, body.position, { x: fx, y: fy });

    // Dampen if too fast
    const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
    if (speed > 5) {
      Body.setVelocity(body, {
        x: body.velocity.x * 0.95,
        y: body.velocity.y * 0.95,
      });
    }
  }
}

/** Get active slimes */
export function getLevel1Slimes() {
  return slimes;
}

/** Cleanup Level 1 */
export function cleanupLevel1() {
  clearBodies();
  slimes = [];
  showScore(false);
}

/** Get current round info */
export function getLevel1RoundInfo() {
  return { current: currentRound + 1, total: LEVEL1_ROUNDS.length };
}

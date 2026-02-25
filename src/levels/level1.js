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
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight * 0.4; // Target center area (slightly above middle)

  // Apply gentle forces to make slimes float around center
  for (const body of slimes) {
    if (!body.slimeNumber || body.isStatic) continue;
    if (!getWorld().bodies.includes(body)) continue;

    // Organic drifting motion
    const fx = Math.sin(floatTimer * 0.015 + body.id * 2.3) * PHYSICS.floatForce;
    const fy = Math.cos(floatTimer * 0.012 + body.id * 1.7) * PHYSICS.floatForce;

    // Pull toward center area (stronger the further from center)
    const dx = centerX - body.position.x;
    const dy = centerY - body.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const pullStrength = 0.000015 * Math.max(0, dist - 100); // Only pull if far from center
    const pullX = (dx / (dist || 1)) * pullStrength;
    const pullY = (dy / (dist || 1)) * pullStrength;

    Body.applyForce(body, body.position, { x: fx + pullX, y: fy + pullY });

    // Dampen if too fast
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

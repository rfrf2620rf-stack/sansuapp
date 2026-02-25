/**
 * level3.js - Lv.3 忍者モード
 * 数字が数秒後に「？」に変化、記憶力で合わせる
 */
import { createSlimePairs, generateRandomPairs } from '../game/slime.js';
import { clearBodies, getWorld, Body } from '../engine/physics.js';
import { LEVEL3, PHYSICS } from '../utils/constants.js';
import { playClearSound } from '../utils/audio.js';
import { resetScore, addMergeScore, showScore, saveHighScore } from '../game/score.js';

let slimes = [];
let onCompleteCallback = null;
let roundCount = 0;
let maxRounds = 5;
let floatTimer = 0;

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

  const pairCount = Math.min(2 + roundCount, 5);
  const pairs = generateRandomPairs(pairCount);
  slimes = createSlimePairs(pairs, width, height);

  // After reveal duration, hide the numbers
  setTimeout(() => {
    for (const body of slimes) {
      if (getWorld().bodies.includes(body)) {
        body.hiddenNumber = true;
      }
    }
  }, LEVEL3.revealDuration);
}

/** Called when two slimes merge in Level 3 */
export function onLevel3Merge(numA, numB) {
  addMergeScore();
  slimes = slimes.filter(s => getWorld().bodies.includes(s));

  const remaining = slimes.filter(s => s.slimeNumber);
  if (remaining.length <= 0) {
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

  for (const body of slimes) {
    if (!body.slimeNumber || body.isStatic) continue;
    if (!getWorld().bodies.includes(body)) continue;

    const fx = Math.sin(floatTimer * 0.02 + body.id * 2.3) * PHYSICS.floatForce;
    const fy = -Math.abs(Math.cos(floatTimer * 0.015 + body.id * 1.7)) * PHYSICS.floatForce * 1.5;
    Body.applyForce(body, body.position, { x: fx, y: fy });

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
export function getLevel3Slimes() {
  return slimes;
}

/** Cleanup Level 3 */
export function cleanupLevel3() {
  clearBodies();
  slimes = [];
  showScore(false);
}

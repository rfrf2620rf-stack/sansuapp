/**
 * collision.js - 衝突判定
 * 合計10 → 合体・消滅 / 合計≠10 → 弾き返し
 */
import { Events, Body, removeBody } from '../engine/physics.js';
import { TARGET_SUM, PHYSICS, EFFECTS } from '../utils/constants.js';
import { playMergeSound, playBounceSound } from '../utils/audio.js';
import { spawnMergeEffect, startShake } from './effects.js';

let mergeCallback = null;
let recentCollisions = new Set(); // Debounce collisions

/** Initialize collision detection */
export function initCollision(engine) {
  Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      handleCollision(pair.bodyA, pair.bodyB);
    }
  });
}

/** Set callback for when slimes merge */
export function onMerge(callback) {
  mergeCallback = callback;
}

/** Handle a collision between two bodies */
function handleCollision(bodyA, bodyB) {
  // Only handle slime-slime collisions
  if (!bodyA.slimeNumber || !bodyB.slimeNumber) return;

  // Debounce: prevent rapid re-triggering
  const key = [bodyA.id, bodyB.id].sort().join('-');
  if (recentCollisions.has(key)) return;
  recentCollisions.add(key);
  setTimeout(() => recentCollisions.delete(key), 500);

  const sum = bodyA.slimeNumber + bodyB.slimeNumber;

  if (sum === TARGET_SUM) {
    // ===== MERGE! =====
    mergeSlimes(bodyA, bodyB);
  } else {
    // ===== BOUNCE! =====
    bounceSlimes(bodyA, bodyB);
  }
}

/** Merge two slimes (sum = 10) */
function mergeSlimes(bodyA, bodyB) {
  // Calculate merge point (midpoint)
  const mx = (bodyA.position.x + bodyB.position.x) / 2;
  const my = (bodyA.position.y + bodyB.position.y) / 2;

  // Play sound
  playMergeSound();

  // Spawn visual effect
  spawnMergeEffect(mx, my);

  // Remove bodies after a brief delay for visual smoothness
  setTimeout(() => {
    removeBody(bodyA);
    removeBody(bodyB);

    if (mergeCallback) {
      mergeCallback(bodyA.slimeNumber, bodyB.slimeNumber, mx, my);
    }
  }, PHYSICS.mergeDelay);
}

/** Bounce two slimes apart (sum ≠ 10) */
function bounceSlimes(bodyA, bodyB) {
  // Direction from A to B
  const dx = bodyB.position.x - bodyA.position.x;
  const dy = bodyB.position.y - bodyA.position.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = dx / dist;
  const ny = dy / dist;

  // Apply repulsive force
  const force = PHYSICS.bounceForce;
  Body.applyForce(bodyA, bodyA.position, { x: -nx * force, y: -ny * force });
  Body.applyForce(bodyB, bodyB.position, { x: nx * force, y: ny * force });

  // Start shake animation
  startShake(bodyA);
  startShake(bodyB);

  // Play bounce sound
  playBounceSound();
}

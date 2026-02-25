/**
 * slime.js - スライムブロック生成
 * 数字に応じたサイズ・質量・色を持つ物理ボディを生成
 */
import { Bodies, addBody } from '../engine/physics.js';
import { SLIME_CONFIG, PHYSICS } from '../utils/constants.js';

/**
 * Create a slime body at the given position
 * @param {number} num - The number (1-9)
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {Matter.Body}
 */
export function createSlime(num, x, y) {
  const config = SLIME_CONFIG[num];
  if (!config) {
    console.warn(`Invalid slime number: ${num}`);
    return null;
  }

  const body = Bodies.circle(x, y, config.radius, {
    restitution: PHYSICS.restitution,
    friction: PHYSICS.friction,
    frictionAir: PHYSICS.frictionAir,
    mass: num,   // Mass equals the number
    label: `slime-${num}`,
  });

  // Custom properties
  body.slimeNumber = num;
  body.shakeTimer = 0;
  body.hiddenNumber = false;

  // Override mass (Matter.js recalculates from density)
  const desiredMass = num * 1.5;
  const currentMass = body.mass;
  const ratio = desiredMass / currentMass;
  body.mass = desiredMass;
  body.inverseMass = 1 / desiredMass;
  body.inertia *= ratio;
  body.inverseInertia = 1 / body.inertia;

  addBody(body);
  return body;
}

/**
 * Create multiple slime pairs for Lv.1
 * @param {number[][]} pairs - Array of [a, b] pairs that sum to 10
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {Matter.Body[]}
 */
export function createSlimePairs(pairs, width, height) {
  const bodies = [];
  const margin = 80;
  const usableW = width - margin * 2;
  const usableH = height - margin * 2;

  pairs.forEach((pair, i) => {
    pair.forEach((num, j) => {
      // Spread out randomly within usable area
      const x = margin + Math.random() * usableW;
      const y = margin + Math.random() * usableH * 0.7;
      const body = createSlime(num, x, y);
      if (body) bodies.push(body);
    });
  });

  return bodies;
}

/**
 * Generate random pairs that sum to 10
 * @param {number} count - Number of pairs
 * @returns {number[][]}
 */
export function generateRandomPairs(count) {
  const pairs = [];
  const possibleA = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (let i = 0; i < count; i++) {
    const a = possibleA[Math.floor(Math.random() * possibleA.length)];
    const b = 10 - a;
    pairs.push([a, b]);
  }

  return pairs;
}

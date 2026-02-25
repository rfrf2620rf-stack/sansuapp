// ===== Color & Size Constants =====

/** Slime visual config per number (1-9) */
export const SLIME_CONFIG = {
  1: { radius: 25, color: '#7ED321', eyeColor: '#fff', label: '1' },
  2: { radius: 30, color: '#4A90D9', eyeColor: '#fff', label: '2' },
  3: { radius: 35, color: '#F5A623', eyeColor: '#fff', label: '3' },
  4: { radius: 40, color: '#BD10E0', eyeColor: '#fff', label: '4' },
  5: { radius: 45, color: '#D0021B', eyeColor: '#fff', label: '5' },
  6: { radius: 40, color: '#417505', eyeColor: '#fff', label: '6' },
  7: { radius: 35, color: '#9013FE', eyeColor: '#fff', label: '7' },
  8: { radius: 30, color: '#F8E71C', eyeColor: '#333', label: '8' },
  9: { radius: 25, color: '#50E3C2', eyeColor: '#fff', label: '9' },
};

/** Physics world parameters */
export const PHYSICS = {
  gravity: 0.05,
  wallThickness: 60,
  restitution: 0.6,
  friction: 0.05,
  frictionAir: 0.025,
  floatForce: 0.002,          // Strong floating force for Lv1
  swipeMultiplier: 8,         // Swipe velocity multiplier
  bounceForce: 0.08,          // Repel force on wrong collision
  mergeDelay: 100,            // ms before merge effect starts
};

/** Background gradient */
export const BG_COLORS = {
  top: '#1a1a2e',
  middle: '#16213e',
  bottom: '#0f3460',
};

/** Effect parameters */
export const EFFECTS = {
  particleCount: 16,
  particleSpeed: 6,
  particleLifetime: 40,
  flashDuration: 15,
  shakeIntensity: 5,
  shakeDuration: 12,
};

/** Level 1 rounds */
export const LEVEL1_ROUNDS = [
  [[5, 5]],
  [[3, 7]],
  [[2, 8], [4, 6]],
  [[1, 9], [3, 7], [5, 5]],
  'random',
];

/** Level 2 config */
export const LEVEL2 = {
  fallSpeed: 1.5,
  buttonCount: 4,
  spawnInterval: 4000,   // ms between falling numbers
  groundY: 0.85,         // percentage of screen height
};

/** Level 3 config */
export const LEVEL3 = {
  revealDuration: 3000,  // ms before number hides
  hiddenChar: '?',
};

/** Target sum */
export const TARGET_SUM = 10;

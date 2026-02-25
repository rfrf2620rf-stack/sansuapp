/**
 * score.js - スコア管理
 */

let score = 0;
let combo = 0;
let lastMergeTime = 0;
const COMBO_WINDOW = 2000; // 2秒以内のコンボ

const scoreEl = document.getElementById('score-display');

/** Reset score */
export function resetScore() {
  score = 0;
  combo = 0;
  lastMergeTime = 0;
  updateDisplay();
}

/** Add score for a merge */
export function addMergeScore() {
  const now = performance.now();

  // Check combo
  if (now - lastMergeTime < COMBO_WINDOW && lastMergeTime > 0) {
    combo++;
  } else {
    combo = 0;
  }
  lastMergeTime = now;

  // Base score + combo bonus
  const baseScore = 100;
  const comboBonus = combo * 50;
  score += baseScore + comboBonus;

  updateDisplay();
  return { score, combo };
}

/** Get current score */
export function getScore() {
  return score;
}

/** Get high score from localStorage */
export function getHighScore(level) {
  const key = `make10-highscore-lv${level}`;
  return parseInt(localStorage.getItem(key) || '0', 10);
}

/** Save high score */
export function saveHighScore(level) {
  const key = `make10-highscore-lv${level}`;
  const prev = getHighScore(level);
  if (score > prev) {
    localStorage.setItem(key, String(score));
    return true; // New high score!
  }
  return false;
}

/** Update score display */
function updateDisplay() {
  if (scoreEl) {
    scoreEl.textContent = String(score);
  }
}

/** Show/hide score */
export function showScore(visible) {
  if (scoreEl) {
    scoreEl.classList.toggle('visible', visible);
  }
}

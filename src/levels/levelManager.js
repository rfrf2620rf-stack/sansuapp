/**
 * levelManager.js - レベル遷移管理
 */

let currentLevel = 0; // 0 = menu

const menuScreen = document.getElementById('menu-screen');
const levelInfo = document.getElementById('level-info');
const messageDisplay = document.getElementById('message-display');

/** Show menu screen */
export function showMenu() {
  currentLevel = 0;
  if (menuScreen) menuScreen.classList.remove('hidden');
  if (levelInfo) levelInfo.classList.remove('visible');
}

/** Hide menu screen */
export function hideMenu() {
  if (menuScreen) menuScreen.classList.add('hidden');
}

/** Set current level */
export function setCurrentLevel(level) {
  currentLevel = level;
  if (levelInfo) {
    levelInfo.textContent = `Lv.${level}`;
    levelInfo.classList.add('visible');
  }
}

/** Get current level */
export function getCurrentLevel() {
  return currentLevel;
}

/** Show a message on screen (e.g., "Round Clear!") */
export function showMessage(text, duration = 1500) {
  if (!messageDisplay) return;
  messageDisplay.textContent = text;
  messageDisplay.classList.add('show');
  setTimeout(() => {
    messageDisplay.classList.remove('show');
  }, duration);
}

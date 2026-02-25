/**
 * input.js - タッチ / マウスのスワイプ操作
 * ドラッグでスライムを掴み、離すとスワイプ方向に発射
 */
import { Body } from './physics.js';
import { PHYSICS, SLIME_CONFIG } from '../utils/constants.js';
import { resumeAudio } from '../utils/audio.js';

let canvas;
let dragging = null;    // { body, offsetX, offsetY, startX, startY, startTime }
let touchPos = null;     // Current touch/mouse position
let onSwipeCallback = null;

/** Initialize input system */
export function initInput(canvasEl, getBodies) {
  canvas = canvasEl;
  const getBodyAt = (x, y) => {
    const bodies = getBodies();
    // Find closest body under the touch point
    let closest = null;
    let closestDist = Infinity;

    for (const body of bodies) {
      if (body.isStatic || !body.slimeNumber) continue;
      const dx = body.position.x - x;
      const dy = body.position.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = SLIME_CONFIG[body.slimeNumber]?.radius || 30;
      if (dist < radius * 1.5 && dist < closestDist) {
        closest = body;
        closestDist = dist;
      }
    }
    return closest;
  };

  // ===== Touch Events =====
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    resumeAudio();
    const touch = e.touches[0];
    const { x, y } = getTouchPos(touch);
    const body = getBodyAt(x, y);
    if (body) {
      startDrag(body, x, y);
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!dragging) return;
    const touch = e.touches[0];
    touchPos = getTouchPos(touch);
    // Move body to finger
    Body.setPosition(dragging.body, { x: touchPos.x, y: touchPos.y });
    Body.setVelocity(dragging.body, { x: 0, y: 0 });
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (dragging) {
      endDrag();
    }
  }, { passive: false });

  // ===== Mouse Events (for desktop testing) =====
  canvas.addEventListener('mousedown', (e) => {
    resumeAudio();
    const { x, y } = getMousePos(e);
    const body = getBodyAt(x, y);
    if (body) {
      startDrag(body, x, y);
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    touchPos = getMousePos(e);
    Body.setPosition(dragging.body, { x: touchPos.x, y: touchPos.y });
    Body.setVelocity(dragging.body, { x: 0, y: 0 });
  });

  canvas.addEventListener('mouseup', () => {
    if (dragging) {
      endDrag();
    }
  });
}

/** Start dragging a body */
function startDrag(body, x, y) {
  dragging = {
    body,
    startX: x,
    startY: y,
    startTime: performance.now(),
  };
  touchPos = { x, y };
  // Make body sensor-like during drag (no rotation)
  Body.setInertia(body, Infinity);
}

/** End drag and launch */
function endDrag() {
  if (!dragging || !touchPos) {
    dragging = null;
    touchPos = null;
    return;
  }

  const { body, startX, startY } = dragging;
  const dx = touchPos.x - startX;
  const dy = touchPos.y - startY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 10) {
    // Swipe: launch in the drag direction
    const speed = Math.min(dist * 0.15, 20);
    const vx = (dx / dist) * speed;
    const vy = (dy / dist) * speed;
    Body.setVelocity(body, { x: vx, y: vy });
  }

  // Restore inertia
  Body.setInertia(body, body.mass * 100);

  if (onSwipeCallback) {
    onSwipeCallback(body);
  }

  dragging = null;
  touchPos = null;
}

/** Register swipe callback */
export function onSwipe(callback) {
  onSwipeCallback = callback;
}

/** Get current drag state */
export function getDragState() {
  if (!dragging || !touchPos) return null;
  return {
    body: dragging.body,
    startX: dragging.startX,
    startY: dragging.startY,
    currentX: touchPos.x,
    currentY: touchPos.y,
  };
}

// ===== Position helpers =====
function getTouchPos(touch) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

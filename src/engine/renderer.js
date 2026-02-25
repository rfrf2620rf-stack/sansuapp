/**
 * renderer.js - Canvas 2D カスタム描画
 * スライムの見た目・背景・エフェクトを描画
 */
import { SLIME_CONFIG, BG_COLORS } from '../utils/constants.js';

let canvas, ctx;
let bgGradient;

/** Initialize renderer */
export function initRenderer(canvasEl) {
  canvas = canvasEl;
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  return { canvas, ctx };
}

/** Resize canvas to fill window */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(dpr, dpr);

  // Recreate background gradient
  bgGradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
  bgGradient.addColorStop(0, BG_COLORS.top);
  bgGradient.addColorStop(0.5, BG_COLORS.middle);
  bgGradient.addColorStop(1, BG_COLORS.bottom);
}

export function getCanvasSize() {
  return { width: window.innerWidth, height: window.innerHeight };
}

/** Clear & draw background */
export function drawBackground() {
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}

/**
 * Draw a slime body
 * @param {Matter.Body} body - Physics body with slimeNumber property
 * @param {number} time - Current timestamp for animations
 */
export function drawSlime(body, time) {
  const num = body.slimeNumber;
  if (!num) return;
  const config = SLIME_CONFIG[num];
  if (!config) return;

  const x = body.position.x;
  const y = body.position.y;
  const baseRadius = config.radius;

  // Wobble animation (idle pulsing)
  const wobble = 1 + Math.sin(time * 0.004 + body.id * 1.7) * 0.04;
  const r = baseRadius * wobble;

  // Shake animation (on wrong collision)
  let shakeX = 0, shakeY = 0;
  if (body.shakeTimer && body.shakeTimer > 0) {
    shakeX = Math.sin(body.shakeTimer * 1.5) * 3;
    shakeY = Math.cos(body.shakeTimer * 2) * 2;
  }

  const drawX = x + shakeX;
  const drawY = y + shakeY;

  ctx.save();

  // ===== Body (gradient circle) =====
  const gradient = ctx.createRadialGradient(
    drawX - r * 0.25, drawY - r * 0.3, r * 0.1,
    drawX, drawY, r
  );
  gradient.addColorStop(0, lightenColor(config.color, 40));
  gradient.addColorStop(0.7, config.color);
  gradient.addColorStop(1, darkenColor(config.color, 30));

  ctx.beginPath();
  ctx.arc(drawX, drawY, r, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Soft glow
  ctx.shadowColor = config.color;
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.arc(drawX, drawY, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // ===== Eyes =====
  const eyeOffsetX = r * 0.25;
  const eyeOffsetY = -r * 0.1;
  const eyeR = r * 0.18;

  // Left eye
  ctx.beginPath();
  ctx.arc(drawX - eyeOffsetX, drawY + eyeOffsetY, eyeR, 0, Math.PI * 2);
  ctx.fillStyle = config.eyeColor;
  ctx.fill();

  // Right eye
  ctx.beginPath();
  ctx.arc(drawX + eyeOffsetX, drawY + eyeOffsetY, eyeR, 0, Math.PI * 2);
  ctx.fillStyle = config.eyeColor;
  ctx.fill();

  // Pupils
  const pupilR = eyeR * 0.55;
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(drawX - eyeOffsetX, drawY + eyeOffsetY, pupilR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(drawX + eyeOffsetX, drawY + eyeOffsetY, pupilR, 0, Math.PI * 2);
  ctx.fill();

  // Eye highlights
  const hlR = pupilR * 0.4;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(drawX - eyeOffsetX - hlR * 0.5, drawY + eyeOffsetY - hlR * 0.5, hlR, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(drawX + eyeOffsetX - hlR * 0.5, drawY + eyeOffsetY - hlR * 0.5, hlR, 0, Math.PI * 2);
  ctx.fill();

  // ===== Number text =====
  const displayText = body.hiddenNumber ? '?' : String(num);
  ctx.font = `bold ${r * 0.7}px "Segoe UI", "Hiragino Sans", sans-serif`;
  ctx.fillStyle = config.eyeColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(displayText, drawX, drawY + r * 0.35);

  ctx.restore();
}

/**
 * Draw a dragging indicator (line from slime to touch)
 */
export function drawDragLine(fromX, fromY, toX, toY) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

// ===== Color utilities =====
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0xff) + percent);
  const b = Math.min(255, (num & 0xff) + percent);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - percent);
  const g = Math.max(0, ((num >> 8) & 0xff) - percent);
  const b = Math.max(0, (num & 0xff) - percent);
  return `rgb(${r},${g},${b})`;
}

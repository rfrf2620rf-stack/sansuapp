/**
 * effects.js - ビジュアルエフェクト
 * パーティクル・フラッシュ・シェイク
 */
import { EFFECTS } from '../utils/constants.js';

// Active effects
const particles = [];
const flashes = [];
const textPopups = [];

/** Spawn merge effect at position */
export function spawnMergeEffect(x, y) {
  // Particles (star burst)
  for (let i = 0; i < EFFECTS.particleCount; i++) {
    const angle = (Math.PI * 2 * i) / EFFECTS.particleCount + Math.random() * 0.3;
    const speed = EFFECTS.particleSpeed * (0.5 + Math.random() * 0.5);
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: EFFECTS.particleLifetime,
      maxLife: EFFECTS.particleLifetime,
      color: `hsl(${40 + Math.random() * 30}, 100%, ${60 + Math.random() * 30}%)`,
      size: 3 + Math.random() * 5,
    });
  }

  // Flash
  flashes.push({
    x, y,
    radius: 10,
    maxRadius: 80,
    life: EFFECTS.flashDuration,
    maxLife: EFFECTS.flashDuration,
  });

  // "10!" text popup
  textPopups.push({
    x, y,
    text: '10!',
    life: 50,
    maxLife: 50,
    vy: -1.5,
  });
}

/** Start shake on a body */
export function startShake(body) {
  body.shakeTimer = EFFECTS.shakeDuration;
}

/** Update all effects each frame */
export function updateEffects() {
  // Update particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1; // gravity on particles
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Update flashes
  for (let i = flashes.length - 1; i >= 0; i--) {
    const f = flashes[i];
    f.life--;
    f.radius = f.maxRadius * (1 - f.life / f.maxLife);
    if (f.life <= 0) flashes.splice(i, 1);
  }

  // Update text popups
  for (let i = textPopups.length - 1; i >= 0; i--) {
    const t = textPopups[i];
    t.y += t.vy;
    t.life--;
    if (t.life <= 0) textPopups.splice(i, 1);
  }
}

/** Draw all effects */
export function drawEffects(ctx) {
  // Draw flashes
  for (const f of flashes) {
    const alpha = f.life / f.maxLife;
    ctx.save();
    const gradient = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.radius);
    gradient.addColorStop(0, `rgba(255, 255, 220, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(255, 200, 50, ${alpha * 0.5})`);
    gradient.addColorStop(1, `rgba(255, 150, 0, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw particles
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;

    // Star shape
    drawStar(ctx, p.x, p.y, p.size * alpha);
    ctx.restore();
  }

  // Draw text popups
  for (const t of textPopups) {
    const alpha = Math.min(1, t.life / (t.maxLife * 0.3));
    const scale = 1 + (1 - t.life / t.maxLife) * 0.5;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `bold ${36 * scale}px "Segoe UI", sans-serif`;
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FF8C00';
    ctx.shadowBlur = 15;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  }
}

/** Draw a 4-pointed star */
function drawStar(ctx, x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const r = i % 2 === 0 ? size : size * 0.4;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

/** Update shake timers on bodies */
export function updateBodyShakes(bodies) {
  for (const body of bodies) {
    if (body.shakeTimer && body.shakeTimer > 0) {
      body.shakeTimer--;
    }
  }
}

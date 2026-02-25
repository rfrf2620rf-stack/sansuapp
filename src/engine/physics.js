/**
 * physics.js - Matter.js ワールド初期化 & 管理
 */
import Matter from 'matter-js';
import { PHYSICS } from '../utils/constants.js';

const { Engine, World, Bodies, Body, Events } = Matter;

let engine, world;
let walls = [];
let canvasW = 0;
let canvasH = 0;

/** Initialize physics engine */
export function initPhysics(width, height) {
  canvasW = width;
  canvasH = height;

  engine = Engine.create({
    gravity: { x: 0, y: PHYSICS.gravity },
  });
  world = engine.world;

  createWalls();
  return { engine, world };
}

/** Create boundary walls */
function createWalls() {
  const t = PHYSICS.wallThickness;
  const opts = { isStatic: true, restitution: 0.5, friction: 0.01, render: { visible: false } };

  walls = [
    // Bottom
    Bodies.rectangle(canvasW / 2, canvasH + t / 2, canvasW + t * 2, t, opts),
    // Top
    Bodies.rectangle(canvasW / 2, -t / 2, canvasW + t * 2, t, opts),
    // Left
    Bodies.rectangle(-t / 2, canvasH / 2, t, canvasH + t * 2, opts),
    // Right
    Bodies.rectangle(canvasW + t / 2, canvasH / 2, t, canvasH + t * 2, opts),
  ];

  World.add(world, walls);
}

/** Step the engine by dt ms */
export function stepPhysics(dt) {
  Engine.update(engine, dt);
}

/** Get engine reference */
export function getEngine() {
  return engine;
}

/** Get world reference */
export function getWorld() {
  return world;
}

/** Clear all non-wall bodies */
export function clearBodies() {
  const bodies = world.bodies.filter(b => !b.isStatic);
  World.remove(world, bodies);
}

/** Resize walls on canvas resize */
export function resizePhysics(width, height) {
  World.remove(world, walls);
  canvasW = width;
  canvasH = height;
  createWalls();
}

/** Add body to world */
export function addBody(body) {
  World.add(world, body);
}

/** Remove body from world */
export function removeBody(body) {
  World.remove(world, body);
}

export { Matter, Engine, World, Bodies, Body, Events };

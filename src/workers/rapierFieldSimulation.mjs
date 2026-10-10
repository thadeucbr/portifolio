import RAPIER from "@dimforge/rapier2d-compat";
import { createFieldLayoutTargets } from "./fieldLayouts.mjs";

const SCALE = 50;
const RADIUS = 0.62;
const CARD_HALF_WIDTH = 1.76;
const CARD_HALF_HEIGHT = 0.64;
const DRAG_SPRING = 100;
const DRAG_DAMPING = 23;
const MAX_THROW_SPEED = 18;

function clamp(value, lower, upper) {
  if (lower > upper) return (lower + upper) / 2;
  return Math.max(lower, Math.min(upper, value));
}

export class RapierFieldSimulation {
  static async create(options) {
    await RAPIER.init();
    return new RapierFieldSimulation(options);
  }

  constructor({ ids, width, height, shape = "chip" }) {
    this.ids = [...ids];
    this.width = width;
    this.height = height;
    this.shape = shape;
    this.layout = "orbital";
    this.selectedId = this.ids[0];
    this.weights = new Map();
    this.pointer = { x: 0, y: 0, active: false };
    this.drag = null;
    this.looseBodies = new Set();
    this.walls = [];
    this.targets = null;
    this.world = new RAPIER.World({ x: 0, y: 0 });
    this.bodies = this.ids.map((_, index) => {
      const angle = (index / this.ids.length) * Math.PI * 2;
      const body = this.world.createRigidBody(
        RAPIER.RigidBodyDesc.dynamic()
          .setTranslation(Math.cos(angle) * 2, Math.sin(angle) * 1.2)
          .setLinearDamping(3.5)
          .setAngularDamping(shape === "card" ? 4 : 8),
      );
      const collider = shape === "card"
        ? RAPIER.ColliderDesc.cuboid(CARD_HALF_WIDTH, CARD_HALF_HEIGHT)
        : RAPIER.ColliderDesc.ball(RADIUS);
      this.world.createCollider(collider.setRestitution(0.28).setFriction(shape === "card" ? 0.68 : 0.2), body);
      return body;
    });
    this.buildWalls();
    this.refreshTargets();
  }

  get halfWidth() {
    return this.width / SCALE / 2;
  }

  get halfHeight() {
    return this.height / SCALE / 2;
  }

  get marginX() {
    return this.shape === "card" ? CARD_HALF_WIDTH : RADIUS;
  }

  get marginY() {
    return this.shape === "card" ? CARD_HALF_HEIGHT : RADIUS;
  }

  toWorldPoint(x, y) {
    return {
      x: clamp((x - this.width / 2) / SCALE, -this.halfWidth + this.marginX, this.halfWidth - this.marginX),
      y: clamp((y - this.height / 2) / SCALE, -this.halfHeight + this.marginY, this.halfHeight - this.marginY),
    };
  }

  buildWalls() {
    this.walls.forEach((wall) => this.world.removeCollider(wall, false));
    const thickness = 0.5;
    this.walls = [
      RAPIER.ColliderDesc.cuboid(this.halfWidth, thickness).setTranslation(0, -this.halfHeight - thickness),
      RAPIER.ColliderDesc.cuboid(this.halfWidth, thickness).setTranslation(0, this.halfHeight + thickness),
      RAPIER.ColliderDesc.cuboid(thickness, this.halfHeight).setTranslation(-this.halfWidth - thickness, 0),
      RAPIER.ColliderDesc.cuboid(thickness, this.halfHeight).setTranslation(this.halfWidth + thickness, 0),
    ].map((description) => this.world.createCollider(description));
  }

  refreshTargets() {
    this.targets = createFieldLayoutTargets(
      this.ids,
      this.layout,
      this.selectedId,
      this.width / SCALE,
      this.height / SCALE,
      this.shape,
    );
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.buildWalls();
    this.refreshTargets();
  }

  setScores(scores) {
    this.looseBodies.clear();
    const values = Object.values(scores);
    if (values.length === 0) return;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    this.weights = new Map(Object.entries(scores).map(([id, score]) => [id, (score - min) / span]));
  }

  setLayout(pattern, selectedId) {
    this.looseBodies.clear();
    this.layout = pattern;
    this.selectedId = selectedId ?? this.ids[0];
    this.refreshTargets();
  }

  setPointer(x, y, active) {
    const point = this.toWorldPoint(x, y);
    this.pointer = { ...point, active };
  }

  startDrag(index, x, y) {
    if (index < 0 || index >= this.bodies.length) return;
    const point = this.toWorldPoint(x, y);
    this.bodies[index].setLinvel({ x: 0, y: 0 }, true);
    this.drag = { index, ...point };
    this.pointer.active = false;
  }

  moveDrag(x, y) {
    if (!this.drag) return;
    const point = this.toWorldPoint(x, y);
    this.drag.x = point.x;
    this.drag.y = point.y;
  }

  endDrag({ vx, vy, free }) {
    if (!this.drag) return;
    const index = this.drag.index;
    const body = this.bodies[index];
    if (free) this.looseBodies.add(index);
    else this.looseBodies.delete(index);
    body.setLinvel({
      x: clamp(vx, -MAX_THROW_SPEED, MAX_THROW_SPEED),
      y: clamp(vy, -MAX_THROW_SPEED, MAX_THROW_SPEED),
    }, true);
    body.setAngvel(clamp(vx * 0.15, -4, 4), true);
    this.drag = null;
  }

  step() {
    const maxRadius = Math.max(1, Math.min(this.halfWidth, this.halfHeight) * 0.95 + this.halfWidth * 0.3);
    this.bodies.forEach((body, index) => {
      const position = body.translation();
      body.resetForces(true);
      if (this.drag?.index === index) {
        const velocity = body.linvel();
        body.addForce({
          x: (this.drag.x - position.x) * DRAG_SPRING - velocity.x * DRAG_DAMPING,
          y: (this.drag.y - position.y) * DRAG_SPRING - velocity.y * DRAG_DAMPING,
        }, true);
        return;
      }

      if (!this.looseBodies.has(index)) {
        const target = this.targets?.[this.ids[index]];
        if (target) {
          const velocity = body.linvel();
          body.addForce({
            x: (target.x - position.x) * 48 - velocity.x * 14,
            y: (target.y - position.y) * 48 - velocity.y * 14,
          }, true);
        } else {
          const length = Math.hypot(position.x, position.y) || 1e-3;
          const weight = this.weights.get(this.ids[index]) ?? 0.5;
          const targetRadius = (1 - weight) * maxRadius;
          body.addForce({
            x: (position.x / length) * (targetRadius - length) * 6,
            y: (position.y / length) * (targetRadius - length) * 6,
          }, true);
        }
      }

      if (this.pointer.active) {
        const dx = position.x - this.pointer.x;
        const dy = position.y - this.pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 1.6 && distance > 1e-3) {
          const force = (1 - distance / 1.6) * 30;
          body.addForce({ x: (dx / distance) * force, y: (dy / distance) * force }, true);
        }
      }
    });

    this.world.step();
    const positions = new Float32Array(this.bodies.length * 2);
    const rotations = new Float32Array(this.bodies.length);
    this.bodies.forEach((body, index) => {
      const position = body.translation();
      positions[index * 2] = position.x * SCALE + this.width / 2;
      positions[index * 2 + 1] = position.y * SCALE + this.height / 2;
      rotations[index] = this.shape === "card" ? body.rotation() : 0;
    });
    return { positions, rotations };
  }

  dispose() {
    this.world.free();
  }
}

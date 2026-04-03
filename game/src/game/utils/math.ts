import type { Vec2 } from '../types/gameTypes';

const TAU = Math.PI * 2;

export function normalizeAngleRadians(angleRadians: number): number {
  const wrapped = angleRadians % TAU;
  return wrapped >= 0 ? wrapped : wrapped + TAU;
}

export function facingVector(angleRadians: number): Vec2 {
  return {
    x: Math.cos(angleRadians),
    y: Math.sin(angleRadians)
  };
}

export function scaleVector(vector: Vec2, scalar: number): Vec2 {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar
  };
}

export function addVector(a: Vec2, b: Vec2): Vec2 {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
}

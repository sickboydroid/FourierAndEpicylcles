import type Complex from "./complex";
import { ctx } from "./simulate";
import Vector from "./vector";

export function randomBrightColor(): string {
  return `hsl(${Math.random() * 360}, ${80}%, ${70}%)`;
}

export function drawVector(v: Vector) {
  const ox = 500;
  const oy = 500;

  v = v.normalize().scale(100);
  const ex = ox + v.x;
  const ey = oy - v.y;

  ctx.strokeStyle = "hsl(200, 60%, 60%)";
  ctx.fillStyle = "hsl(100, 60%, 60%)";
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(ex, ey, 4, 0, Math.PI * 2);
  ctx.fill();
}

export function lowerBound(arr: number[], tar: number): number {
  let l = 0,
    r = arr.length; // [l, r)

  while (l < r) {
    const m = (l + r) >>> 1; // fast floor((l+r)/2)
    if (arr[m] < tar) l = m + 1;
    else r = m;
  }
  return l; // first position >= x
}

export function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

export function complexLerp(start: Complex, end: Complex, t: number) {
  // start + (end - start) * t
  return end.subtract(start).scale(t).add(start);
}

export function vectorLerp(start: Vector, end: Vector, t: number) {
  // start + (end - start) * t
  return end.subtract(start).scale(t).add(start);
}

export function vectorLerp2(
  start: [number, number],
  end: [number, number],
  t: number,
): [number, number] {
  const vec = vectorLerp(
    new Vector(start[0], start[1]),
    new Vector(end[0], end[1]),
    t,
  );
  return [vec.x, vec.y];
}

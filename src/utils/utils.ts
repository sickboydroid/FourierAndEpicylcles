import type Complex from "../math/complex_number";
import Vector from "../math/vector";

export function randomBrightColor(): string {
  return `hsl(${Math.random() * 360}, ${80}%, ${70}%)`;
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

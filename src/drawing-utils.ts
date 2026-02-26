import { Point } from "./point";
import { premadeDrawings } from "./premade-drawings";
import { WORLD_WIDTH, WORLD_HEIGHT } from "./simulate";
import Vector from "./vector";

const KEY_HAS_SAVED_PREMADE_DRAWINGS = "has_saved_premade_drawings";

export type Drawing = {
  width: number;
  height: number;
  name: string;
  points: [number, number][];
  key: string;
};

export function savePremadeDrawings() {
  // if (localStorage.getItem(KEY_HAS_SAVED_PREMADE_DRAWINGS)) return;
  for (const premadeDrawing of premadeDrawings)
    saveDrawing(premadeDrawing.name, toBezierPoints(premadeDrawing.points));
  localStorage.setItem(KEY_HAS_SAVED_PREMADE_DRAWINGS, "true");
}

/**
 * Converts the points used in drawing to a more simple format
 **/
export function toSimplePoints(points: Point[]): [number, number][] {
  const res: [number, number][] = [];
  for (const point of points) {
    res.push([point.pos.x, point.pos.y]);
  }
  return res;
}
export function toBezierPoints(points: [number, number][]): Point[] {
  const parsedPoints: Point[] = [];
  for (const point of points) {
    parsedPoints.push(new Point(new Vector(point[0], point[1])));
  }

  if (parsedPoints.length >= 2) parsedPoints[1].is_constrol_point = true;
  for (let i = 3; i < parsedPoints.length; i += 3) {
    parsedPoints[i].is_constrol_point = true;
    if (i + 1 < parsedPoints.length)
      parsedPoints[i + 1].is_constrol_point = true;
  }
  return parsedPoints;
}

export function getSavedDrawings() {
  const res: Drawing[] = [];
  const keys = getSavedDrawingKeys();
  for (const key of keys) {
    const drawing = JSON.parse(localStorage.getItem(key) as string) as Drawing;
    res.push(drawing);
  }
  return res;
}

export function saveDrawing(name: string, points: Point[]) {
  const parsedPoints = toSimplePoints(points);
  const key = generateDrawingKey();
  const keys = getSavedDrawingKeys();
  const drawing: Drawing = {
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    name,
    points: parsedPoints,
    key,
  };
  keys.push(key);
  localStorage.setItem(key, JSON.stringify(drawing));
  localStorage.setItem("drawings", JSON.stringify(keys));
  console.log("Saved:", name, "as", key);
  return drawing;
}

function getSavedDrawingKeys(): string[] {
  let resString = localStorage.getItem("drawings");
  let res: string[] = [];
  if (resString) res = JSON.parse(resString) as string[];
  return res;
}

export function deleteDrawing(key: string) {
  const keys = getSavedDrawingKeys();
  localStorage.setItem(
    "drawings",
    JSON.stringify(keys.filter((e) => e != key)),
  );
}

function generateDrawingKey() {
  return crypto.randomUUID();
}

import { WORLD_WIDTH, WORLD_HEIGHT } from "../views/view_drawing";
import { premadeDrawings } from "./premade_drawings";


export type Drawing = {
  width: number;
  height: number;
  name: string;
  points: [number, number][];
  key: string;
};

export function savePremadeDrawings() {
  const KEY_HAS_SAVED_PREMADE_DRAWINGS = "has_saved_premade_drawings";
  if (localStorage.getItem(KEY_HAS_SAVED_PREMADE_DRAWINGS)) return;
  for (const premadeDrawing of premadeDrawings) {
    saveDrawing(premadeDrawing.name, premadeDrawing.points);
  }
  localStorage.setItem(KEY_HAS_SAVED_PREMADE_DRAWINGS, "true");
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

export function saveDrawing(name: string, points: [number, number][]) {
  const key = generateDrawingKey();
  const keys = getSavedDrawingKeys();
  const drawing: Drawing = {
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    name,
    points,
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

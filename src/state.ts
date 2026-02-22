import ComplexFunction from "./function";
import type { Point } from "./point";

export const precisions = {
  integration_precision: 0.0001,
  phasor_circle_precision: 0.001,
  curve_sampling_precision: 0.001,
};

export const selectDrawingState = {};

export const drawingState = {
  lastTime: 0,
  /**
   * [p1, c1, p2, c2, c2.5, p3, c3 ...]
   * px = is a point, cx is control point of px for prev curve and cx.5 is
   * control point of px for next curve
   */
  points: [] as Point[],
};

export const simulateState = {
  animationProgress: 0,
  animationSpeed: 0.1,
  pointTrace: [] as [number, number][],
  lastTime: 0,
  isRunning: false,
  function: null as ComplexFunction | null,
};

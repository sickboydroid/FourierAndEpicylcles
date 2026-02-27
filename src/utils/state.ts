import { BezierCurve } from "../drawing/bezier_curve";
import type ComplexFunction from "../math/complex_function";

export const precisions = {
  integration_precision: 0.0005,
  curve_sampling_precision: 0.0005,
  function_drawing_precision: 0.001,
};

export const selectDrawingState = {
  hasInitializedHanlers: false,
};

export const drawingState = {
  lastTime: 0,
  curve: new BezierCurve(),
  hasInitializedHanlers: false,
};

export const simulateState = {
  animationProgress: 0,
  animationSpeed: 0.1,
  pointTrace: [] as [number, number][],
  lastTime: 0,
  isRunning: false,
  isProgressing: true,
  function: null as ComplexFunction | null,
  hasInitializedHanlers: false,
  vectorCount: 100,
  showCircles: false,
  showVectors: true,
  showFunction: true,
};

export const color = {
  CANVAS_BG_COLOR: "#0F1115",
  GRID_MINOR_COLOR: "#1A1F27",
  GRID_MAJOR_COLOR: "#2A2F3A",
  AXIS_COLOR: "#6C7486",
  VECTOR_COLOR: "#FFB33F",
  VECTOR_HEAD_COLOR: "#FFD166",
  FUNCTION_CURVE_COLOR: "#4FC3F7",
  POINT_TRACE_COLOR: "#FFFFFF",
  CIRCLE_COLOR: "#7EACB5",
  BEZIER_POINT_COLOR: "#0096FF",
  BEZIER_SELECTED_POINT_COLOR: "white",
};

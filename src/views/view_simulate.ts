import { musicalNote } from "../drawing/premade_drawings";
import ComplexFunction from "../math/complex_function";
import type { Phasor } from "../math/phasor";
import Vector from "../math/vector";
import { color, precisions, simulateState as state } from "../utils/state";

const root = document.querySelector("div.view.simulate") as HTMLDivElement;
const canvas = root.querySelector("#simulate-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
export let WORLD_WIDTH = window.innerWidth;
export let WORLD_HEIGHT = window.innerHeight;
const progressRange = root.querySelector("#progress") as HTMLInputElement;
const progressLabel = root.querySelector("#progress-label") as HTMLLabelElement;

const frameRateInfo = {
  lastUpdateTime: 0,
  frameCountSinceUpdate: 0,
  lastFrameRate: 60,
};

/******************Initializers**********************/

export function initView() {
  state.isRunning = true;
  state.pointTrace = [];
  state.animationProgress = 0;
  state.lastTime = 0;

  initCanvas();
  initInputHandlers();
  initFunction();
}

export function destroyView() {
  state.isRunning = false;
}

export function pauseView() {}

function initInputHandlers() {
  if (state.hasInitializedHanlers) return;
  state.hasInitializedHanlers = true;
  const btnPlayToggle = root.querySelector("#play-toggle") as HTMLButtonElement;
  const inputVectorCount = root.querySelector(
    "#vector-count",
  ) as HTMLInputElement;
  const inputShowCircles = root.querySelector(
    "#show-circles",
  ) as HTMLInputElement;
  const inputShowVectors = root.querySelector(
    "#show-vectors",
  ) as HTMLInputElement;
  const inputShowFunction = root.querySelector(
    "#show-function",
  ) as HTMLInputElement;
  inputVectorCount.addEventListener("change", () => {
    let count = Number(inputVectorCount.value);
    count = Math.min(count, 500);
    state.vectorCount = count;
    inputVectorCount.value = count.toString();
    initFunction();
  });
  inputShowFunction.addEventListener("change", () => {
    state.showFunction = inputShowFunction.checked;
  });
  btnPlayToggle.addEventListener("click", () => {
    state.isProgressing = !state.isProgressing;
    if (state.isProgressing) btnPlayToggle.textContent = "Pause";
    else btnPlayToggle.textContent = "Play";
  });
  progressRange.addEventListener("input", () => {
    progressLabel.textContent =
      (Number(progressRange.value) * 100).toFixed(1) + "%";
    state.animationProgress = Number(progressRange.value);
    state.isProgressing = false;
    btnPlayToggle.textContent = "Play";
    syncAnimationProgress();
  });
  inputShowCircles.addEventListener("change", () => {
    state.showCircles = inputShowCircles.checked;
  });
  inputShowVectors.addEventListener("change", () => {
    state.showVectors = inputShowVectors.checked;
  });
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);

  canvas.style.width = width + "px";
  canvas.style.height = height + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // keep origin at center
  ctx.translate(width / 2, height / 2);

  WORLD_WIDTH = width;
  WORLD_HEIGHT = height;
}

function initCanvas() {
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  requestAnimationFrame(draw);
}

function initFunction() {
  if (!state.function)
    state.function = ComplexFunction.fromBezierCurvePoints(musicalNote);
  const min = Math.floor(state.vectorCount / 2);
  const max = state.vectorCount - min;
  state.function.computePhasors(-min, max);
}

function updateProgress(progress: number) {
  const cur = Number(progressRange.value);
  if (Math.abs(cur - progress) > 0.001) {
    progressRange.value = progress.toString();
    progressLabel.textContent =
      (Number(progressRange.value) * 100).toFixed(1) + "%";
  }
}

/******************Drawing Logic**********************/

function clearCanvas() {
  ctx.fillStyle = color.CANVAS_BG_COLOR;
  ctx.fillRect(-WORLD_WIDTH / 2, -WORLD_HEIGHT / 2, WORLD_WIDTH, WORLD_HEIGHT);
}

function updateFrameRate(curTime: number) {
  if (state.lastTime == 0) state.lastTime = curTime;
  if (curTime - frameRateInfo.lastUpdateTime >= 1000) {
    frameRateInfo.lastFrameRate = frameRateInfo.frameCountSinceUpdate;
    frameRateInfo.frameCountSinceUpdate = 0;
    frameRateInfo.lastUpdateTime = curTime;
  }
  frameRateInfo.frameCountSinceUpdate++;
}

function draw(curTime: number) {
  if (!state.isRunning) return;
  clearCanvas();
  updateFrameRate(curTime);
  drawGrid();
  const deltaTime = Math.min(curTime - state.lastTime, 50) / 1000;
  state.lastTime = curTime;
  drawFunction();
  drawPhasors();
  if (state.isProgressing) {
    state.animationProgress += state.animationSpeed * deltaTime;
    if (state.animationProgress > 1) {
      state.animationProgress = 0;
      state.pointTrace.length = 0;
    }
  }
  updateProgress(state.animationProgress);
  requestAnimationFrame(draw);
}

function drawGrid() {
  ctx.strokeStyle = color.GRID_MAJOR_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -WORLD_HEIGHT / 2);
  ctx.lineTo(0, WORLD_HEIGHT / 2);
  ctx.moveTo(-WORLD_WIDTH / 2, 0);
  ctx.lineTo(WORLD_WIDTH / 2, 0);
  ctx.stroke();
}

function drawPhasors() {
  let res = Vector.zero();
  for (let phasor of state.function!.phasors) {
    drawPhasor(phasor, res);
    res = res.add(phasor.getValueAt(state.animationProgress).toVector());
  }

  // draw writing tip

  state.pointTrace.push([res.x, res.y]);
  drawPointTrace();
  // ctx.fillStyle = "red";
  // ctx.beginPath();
  // ctx.arc(res.x, res.y, 4, 0, 2 * Math.PI);
  // ctx.fill();
  // if (state.pointTrace.length > MAX_TRACE_POINTS) state.pointTrace.shift();
}

function drawPointTrace() {
  if (state.pointTrace.length == 0) return;
  ctx.strokeStyle = color.POINT_TRACE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(state.pointTrace[0][0], state.pointTrace[0][1]);
  for (let i = 1; i < state.pointTrace.length; i++) {
    ctx.lineTo(state.pointTrace[i][0], state.pointTrace[i][1]);
  }
  ctx.stroke();
}

function drawFunction() {
  if (!state.showFunction) return;
  ctx.strokeStyle = color.FUNCTION_CURVE_COLOR;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 1; i += precisions.function_drawing_precision) {
    let x = state.function!.getValueAt(i).getReal();
    let y = state.function!.getValueAt(i).getImag();
    if (i == 0) ctx.moveTo(x, y);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}
function drawPhasor(phasor: Phasor, source: Vector) {
  if (state.showVectors) {
    // draw the line
    drawVector(
      source,
      phasor.getValueAt(state.animationProgress).toVector().add(source),
    );
  }

  if (state.showCircles) {
    const radius = phasor.getValueAt(0).toVector().magnitude();
    
    ctx.strokeStyle = color.CIRCLE_COLOR;
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.arc(source.x, source.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

function drawVector(from: Vector, to: Vector) {
  // draw line
  ctx.strokeStyle = color.VECTOR_COLOR;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  // draw triangular tip
  const vec = to.subtract(from);
  const height = 0.1 * vec.magnitude();
  const base = 0.5 * height;
  const triangleBase = from.add(
    vec.normalize().scale(vec.magnitude() - height),
  );
  const triangleTopCorner = triangleBase.add(
    vec
      .rotate(Math.PI / 2)
      .normalize()
      .scale(base),
  );
  const triangleBottomCorner = triangleBase.add(
    vec
      .rotate((3 * Math.PI) / 2)
      .normalize()
      .scale(base),
  );
  const triangleTip = from.add(vec);
  ctx.fillStyle = color.VECTOR_HEAD_COLOR;
  ctx.beginPath();
  ctx.moveTo(triangleBase.x, triangleBase.y);
  ctx.lineTo(triangleTopCorner.x, triangleTopCorner.y);
  ctx.lineTo(triangleTip.x, triangleTip.y);
  ctx.lineTo(triangleBottomCorner.x, triangleBottomCorner.y);
  ctx.lineTo(triangleBase.x, triangleBase.y);
  ctx.fill();
}

function syncAnimationProgress() {
  state.pointTrace = [];
  for (
    let i = 0;
    i <= state.animationProgress;
    i += state.animationSpeed / 10
  ) {
    let res = Vector.zero();
    for (let phasor of state.function!.phasors)
      res = res.add(phasor.getValueAt(i).toVector());
    state.pointTrace.push([res.x, res.y]);
  }
}

import Complex from "./complex";
import ComplexFunction from "./function";
import { Phasor } from "./phasor";
import { precisions, simulateState as state } from "./state";
import Vector from "./vector";

export let canvas = document.querySelector("#layer1") as HTMLCanvasElement;
export const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
export const WORLD_WIDTH = window.innerWidth;
export const WORLD_HEIGHT = window.innerHeight;
const MAX_TRACE_POINTS = 10000;
const progressRange = document.querySelector(
  ".controls #progress",
) as HTMLInputElement;
const progressLabel = document.querySelector(
  ".controls #progress-label",
) as HTMLLabelElement;

const frameRateInfo = {
  lastUpdateTime: 0,
  frameCountSinceUpdate: 0,
  lastFrameRate: 60,
};
let func = getDefaultFunction();
/******************Initializers**********************/

export function initView() {
  state.isRunning = true;
  state.pointTrace = [];
  state.animationProgress = 0;
  state.lastTime = 0;
  func = getDefaultFunction();

  initCanvas();
  initInputHandlers();
  initControls();
  initFunction();
}

export function destroyView() {
  state.isRunning = false;
}

export function pauseView() {}

function initCanvas() {
  canvas.width = WORLD_WIDTH;
  canvas.height = WORLD_HEIGHT;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // keep origin at center
  ctx.translate(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
  requestAnimationFrame(draw);
}

function initControls() {
  progressRange.addEventListener("input", (event) => {
    progressLabel.textContent =
      (Number(progressRange.value) * 100).toFixed(1) + "%";
  });
}

function initInputHandlers() {}

function initFunction() {
  func!.computePhasors(-100, 100);
}

function getDefaultFunction() {
  if (state.function) return state.function;
  console.info("Create empty function as no function is provided");
  const func = new ComplexFunction();
  const scale = 200;
  const getMapping = (at: number) =>
    Complex.fromCartesian(at, Math.sin(3 * Math.PI * at * at)).scale(scale);
  for (let i = 0; i <= 1; i += 0.0001) {
    func.addMapping(i, getMapping(i));
  }
  func.addMapping(1, getMapping(0));
  return func;
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
  ctx.fillStyle = "rgba(40,40,40,1)";
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
  state.animationProgress += state.animationSpeed * deltaTime;
  if (state.animationProgress > 1) {
    state.animationProgress = 0;
    state.pointTrace.length = 0;
  }
  updateProgress(state.animationProgress);
  requestAnimationFrame(draw);
}

function drawGrid() {
  ctx.strokeStyle = "gray";
  ctx.beginPath();
  ctx.moveTo(0, -WORLD_HEIGHT / 2);
  ctx.lineTo(0, WORLD_HEIGHT / 2);
  ctx.moveTo(-WORLD_WIDTH / 2, 0);
  ctx.lineTo(WORLD_WIDTH / 2, 0);
  ctx.stroke();
}

function drawPhasors() {
  let res = Vector.zero();
  for (let phasor of func!.phasors) {
    drawPhasor(phasor, res);
    res = res.add(phasor.getValueAt(state.animationProgress).toVector());
  }

  // draw writing tip
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(res.x, res.y, 4, 0, 2 * Math.PI);
  ctx.fill();
  drawPointTrace();
  state.pointTrace.push([res.x, res.y]);
  if (state.pointTrace.length > MAX_TRACE_POINTS) state.pointTrace.shift();
}

function drawPointTrace() {
  if (state.pointTrace.length == 0) return;
  ctx.strokeStyle = "blue";
  ctx.beginPath();
  ctx.moveTo(state.pointTrace[0][0], state.pointTrace[0][1]);
  for (let i = 1; i < state.pointTrace.length; i++) {
    ctx.lineTo(state.pointTrace[i][0], state.pointTrace[i][1]);
  }
  ctx.stroke();
}

function drawFunction() {
  ctx.strokeStyle = "cyan";
  ctx.beginPath();
  for (let i = 0; i < func!.output.length; i++) {
    let x = func!.output[i].getReal();
    let y = func!.output[i].getImag();
    if (i == 0) ctx.moveTo(x, y);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawPhasor(phasor: Phasor, source: Vector) {
  // draw the line
  ctx.strokeStyle = "white";
  ctx.beginPath();
  const pos = phasor.getValueAt(state.animationProgress).toVector().add(source);
  ctx.moveTo(source.x, source.y);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  // draw the circle
  ctx.beginPath();
  for (let i = 0; i <= 1; i += precisions.phasor_circle_precision) {
    ctx.strokeStyle = "gray";
    const pos = phasor.getValueAt(i).toVector().add(source);
    let x = pos.x;
    let y = pos.y;
    if (i == 0) ctx.moveTo(x, y);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

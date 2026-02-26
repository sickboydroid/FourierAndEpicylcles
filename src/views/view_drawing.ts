import { viewManager } from "../main";
import ComplexFunction from "../math/function";
import { Point } from "../math/point";
import Vector from "../math/vector";
import { saveDrawing, toSimplePoints } from "../utils/drawing-utils";
import { color, simulateState, drawingState as state } from "../utils/state";

const root = document.querySelector("div.view.drawing") as HTMLDivElement;
export const canvas = root.querySelector(
  "#drawing-canvas",
) as HTMLCanvasElement;
export const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
export const WORLD_WIDTH = window.innerWidth;
export const WORLD_HEIGHT = window.innerHeight;
const translateX = WORLD_WIDTH / 2;
const translateY = WORLD_HEIGHT / 2;
const pointDistThreshold = 20;
type MODE_ADD = "add";
type MODE_REMOVE = "delete";
let mode: MODE_ADD | MODE_REMOVE = "add";

/******************Initializers**********************/

export function initView() {
  initCanvas();
  initInputHandlers();
}

export function destroyView() {}

function initCanvas() {
  canvas.width = WORLD_WIDTH;
  canvas.height = WORLD_HEIGHT;
  // keep origin at center
  ctx.translate(translateX, translateY);
  requestAnimationFrame(draw);
}

function initInputHandlers() {
  if (state.hasInitializedHanlers) return;
  state.hasInitializedHanlers = true;
  initInputHandlersForPoints();
  initInputHanldersForButtons();
}

function initInputHanldersForButtons() {
  const btnAdd = root.querySelector("button#add") as HTMLButtonElement;
  const btnDelete = root.querySelector("button#delete") as HTMLButtonElement;
  const btnSave = root.querySelector("button#save") as HTMLButtonElement;
  const btnClose = root.querySelector("button#close") as HTMLButtonElement;
  const dialogSave = root.querySelector(
    "dialog#save-dialog",
  ) as HTMLDialogElement;

  btnAdd.addEventListener("click", () => {
    btnDelete.classList.remove("selected");
    btnAdd.classList.add("selected");
    mode = "add";
  });

  btnDelete.addEventListener("click", () => {
    btnAdd.classList.remove("selected");
    btnDelete.classList.add("selected");
    mode = "delete";
  });

  btnSave.addEventListener("click", () => {
    dialogSave.showModal();
  });

  btnClose.addEventListener("click", () => {
    viewManager.hideDrawing();
  });

  const dialogBtnSave = dialogSave.querySelector(
    "button[value='save']",
  ) as HTMLButtonElement;
  const dialogBtnCancel = dialogSave.querySelector(
    "button[value='cancel']",
  ) as HTMLButtonElement;

  dialogBtnSave.addEventListener("click", () => {
    const input = document.getElementById("drawing-name") as HTMLInputElement;
    const name = input.value;
    if (!name) return;
    input.value = "";
    saveDrawing(name, state.points);
    console.log(WORLD_WIDTH, WORLD_HEIGHT);
    console.log(toSimplePoints(state.points));
    simulateState.function = ComplexFunction.fromBezierCurvePoints(
      toSimplePoints(state.points),
    );
    dialogSave.close();
    viewManager.hideDrawing();
    viewManager.showSimulate();
  });

  dialogBtnCancel.addEventListener("click", () => {
    dialogSave.close();
  });
}

function initInputHandlersForPoints() {
  let selectedPoint: number = -1;
  let selectedClosestPoint: number = -1;

  // Handle clicking: Either select an existing point OR add a new one
  canvas.addEventListener("mousedown", (event) => {
    // Get mouse coordinates relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left - translateX;
    const mouseY = event.clientY - rect.top - translateY;
    const clickVec = new Vector(mouseX, mouseY);

    // Closest point to click
    let closestPointIdx = getClosestPoint(clickVec);
    if (closestPointIdx != -1) {
      if (mode == "delete") {
        deletePoint(state.points[closestPointIdx]);
      } else {
        selectedPoint = closestPointIdx;
        state.points[selectedPoint].selected = true;
      }
    } else if (mode == "add") {
      addPoint(clickVec);
    }
  });

  canvas.addEventListener("mousemove", (event) => {
    if (selectedPoint != -1) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left - translateX;
      const mouseY = event.clientY - rect.top - translateY;
      const mouseClickVec = new Vector(mouseX, mouseY);
      movePointTo(selectedPoint, mouseClickVec);
      const closestPoint = getClosestPoint(mouseClickVec, 10, selectedPoint);
      if (closestPoint == selectedClosestPoint) return;
      if (selectedClosestPoint != -1)
        state.points[selectedClosestPoint].selected = false;
      if (closestPoint != -1) state.points[closestPoint].selected = true;
      selectedClosestPoint = closestPoint;
    }
  });

  canvas.addEventListener("mouseup", () => {
    if (selectedPoint != -1) {
      state.points[selectedPoint].selected = false;
      if (selectedClosestPoint != -1) {
        state.points[selectedClosestPoint].selected = false;

        if (
          (selectedPoint == 0 &&
            selectedClosestPoint == state.points.length - 2) ||
          (selectedPoint == state.points.length - 2 &&
            selectedClosestPoint == 0)
        ) {
          // if joining starting and ending point, align ending control point to starting
          const startPoint = state.points[selectedClosestPoint];
          const startCP = state.points[selectedClosestPoint + 1];
          const endPoint = state.points[selectedPoint];
          const endCP = state.points[selectedPoint + 1];
          endCP.pos = endPoint.pos.add(
            startPoint.pos
              .subtract(startCP.pos)
              .normalize()
              .scale(endCP.pos.subtract(endPoint.pos).magnitude()),
          );
        }
        movePointTo(selectedPoint, state.points[selectedClosestPoint].pos);

        selectedClosestPoint = -1;
      }
      selectedPoint = -1;
    }
  });

  canvas.addEventListener("mouseleave", () => {
    if (selectedPoint != -1) {
      state.points[selectedPoint].selected = false;
      selectedPoint = -1;
    }
  });
}

function movePointTo(pointIdx: number, newPos: Vector) {
  const oldPos = state.points[pointIdx].pos;
  const change = newPos.subtract(oldPos);
  state.points[pointIdx].pos = state.points[pointIdx].pos.add(change);
  if (state.points[pointIdx].is_constrol_point) {
    // move other control points
    let otherControlPoint = null;
    let mainPoint = null as Point | null;
    if (
      pointIdx + 1 < state.points.length &&
      state.points[pointIdx + 1].is_constrol_point
    ) {
      mainPoint = state.points[pointIdx - 1];
      otherControlPoint = state.points[pointIdx + 1];
    } else if (
      pointIdx - 1 >= 0 &&
      state.points[pointIdx - 1].is_constrol_point
    ) {
      mainPoint = state.points[pointIdx - 2];
      otherControlPoint = state.points[pointIdx - 1];
    }
    if (otherControlPoint && mainPoint) {
      const otherControlPointNewPos = mainPoint.pos
        .subtract(state.points[pointIdx].pos)
        .normalize()
        .scale(otherControlPoint.pos.subtract(mainPoint.pos).magnitude())
        .add(mainPoint.pos);
      otherControlPoint.pos = otherControlPointNewPos;
    }
  } else {
    // move both control points
    if (pointIdx + 1 < state.points.length)
      state.points[pointIdx + 1].pos =
        state.points[pointIdx + 1].pos.add(change);
    if (pointIdx != 0 && pointIdx + 2 < state.points.length)
      state.points[pointIdx + 2].pos =
        state.points[pointIdx + 2].pos.add(change);
  }
}

function getClosestPoint(
  to: Vector,
  threshold = pointDistThreshold,
  except = -1,
) {
  let closestPointIdx = -1;
  let closestDist = Infinity;
  for (let i = 0; i < state.points.length; i++) {
    if (i == except) continue;
    const distSqr = state.points[i].pos.distSq(to);
    if (distSqr < closestDist) {
      closestPointIdx = i;
      closestDist = distSqr;
    }
  }

  if (closestDist < threshold * threshold) return closestPointIdx;
  return -1;
}

function deletePoint(point: Point) {
  if (state.points.length == 1) {
    state.points.length = 0;
    return;
  } else if (point.is_constrol_point) return;
  for (let i = 0; i < state.points.length; i++) {
    if (state.points[i] == point) {
      if (i == 0) {
        state.points.splice(0, 2);
        state.points.splice(1, 1);
      } else if (i == state.points.length - 2) {
        state.points.splice(i - 1, 3);
      } else {
        state.points.splice(i, 3);
      }
      break;
    }
  }
}

function addPoint(at: Vector, controlPointDist = 60) {
  if (state.points.length > 0) {
    const lastPoint = state.points.at(-1)!;
    let lastControlPointVector = new Vector(
      lastPoint.pos.x,
      lastPoint.pos.y - controlPointDist,
    );

    if (lastPoint.is_constrol_point) {
      // this is pn where n > 2
      const secondLastPoint = state.points.at(-2)!;
      const dir = secondLastPoint.pos.subtract(lastPoint.pos);
      lastControlPointVector = lastPoint.pos
        .add(dir)
        .add(dir.normalize().scale(controlPointDist));
    }
    const point = new Point(at);
    const controlPointLast = new Point(lastControlPointVector);
    const controlPointCur = new Point(
      new Vector(at.x, at.y + controlPointDist),
    );
    controlPointLast.is_constrol_point = true;
    controlPointCur.is_constrol_point = true;
    state.points.push(controlPointLast);
    state.points.push(point);
    state.points.push(controlPointCur);
  } else {
    const point = new Point(new Vector(at.x, at.y));
    state.points.push(point);
  }
}

/******************Drawing Logic**********************/

function clearCanvas() {
  ctx.fillStyle = color.CANVAS_BG_COLOR;
  ctx.fillRect(-translateX, -translateY, WORLD_WIDTH, WORLD_HEIGHT);
}

function draw(curTime: number) {
  clearCanvas();
  state.lastTime = curTime;
  drawGrid();
  drawBezier();
  drawPoints();
  requestAnimationFrame(draw);
}

function drawPoints() {
  if (state.points.length == 2) {
    state.points[0].draw(ctx);
    return;
  }
  for (const point of state.points) {
    if (point.is_constrol_point) point.color = "red";
    point.draw(ctx);
  }
}

function drawBezier() {
  if (state.points.length <= 1) return;
  // draw bezier
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();

  ctx.moveTo(state.points[0].pos.x, state.points[0].pos.y);
  ctx.bezierCurveTo(
    state.points[1].pos.x,
    state.points[1].pos.y,
    state.points[3].pos.x,
    state.points[3].pos.y,
    state.points[2].pos.x,
    state.points[2].pos.y,
  );
  for (let i = 2; i < state.points.length - 4; i += 3) {
    ctx.moveTo(state.points[i].pos.x, state.points[i].pos.y);
    ctx.bezierCurveTo(
      state.points[i + 2].pos.x,
      state.points[i + 2].pos.y,
      state.points[i + 4].pos.x,
      state.points[i + 4].pos.y,
      state.points[i + 3].pos.x,
      state.points[i + 3].pos.y,
    );
  }
  ctx.stroke();

  // draw lines
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(state.points[0].pos.x, state.points[0].pos.y);
  ctx.lineTo(state.points[1].pos.x, state.points[1].pos.y);
  for (let i = 2; i < state.points.length - 1; i += 3) {
    ctx.moveTo(state.points[i].pos.x, state.points[i].pos.y);
    ctx.lineTo(state.points[i + 1].pos.x, state.points[i + 1].pos.y);
    if (i + 2 < state.points.length) {
      ctx.moveTo(state.points[i].pos.x, state.points[i].pos.y);
      ctx.lineTo(state.points[i + 2].pos.x, state.points[i + 2].pos.y);
    }
  }
  ctx.stroke();
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

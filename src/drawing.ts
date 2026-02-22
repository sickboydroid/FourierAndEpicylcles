import { saveDrawing } from "./drawing-utils";
import { viewManager } from "./main";
import { Point } from "./point";
import { drawingState as state } from "./state";
import Vector from "./vector";

export let canvas = document.querySelector(
  "#drawing-canvas",
) as HTMLCanvasElement;
export const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
export const WORLD_WIDTH = window.innerWidth;
export const WORLD_HEIGHT = window.innerHeight;
const translateX = WORLD_WIDTH / 2;
const translateY = WORLD_HEIGHT / 2;
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
  initInputHandlersForPoints();
  initInputHanldersForButtons();
}

function initInputHanldersForButtons() {
  const btnAdd = document.querySelector(".add button") as HTMLButtonElement;
  const btnDelete = document.querySelector(
    ".delete button",
  ) as HTMLButtonElement;
  const btnSave = document.querySelector(".save button") as HTMLButtonElement;
  const btnClose = document.querySelector(".close button") as HTMLButtonElement;
  const dialogSave = document.querySelector(
    "#save-dialog",
  ) as HTMLDialogElement;

  btnAdd.addEventListener("click", (event) => {
    btnDelete.classList.remove("selected");
    btnAdd.classList.add("selected");
    mode = "add";
  });

  btnDelete.addEventListener("click", (event) => {
    btnAdd.classList.remove("selected");
    btnDelete.classList.add("selected");
    mode = "delete";
  });

  btnSave.addEventListener("click", (event) => {
    dialogSave.showModal();
  });

  btnClose.addEventListener("click", (event) => {
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
    saveDrawing(name, state.points);
    dialogSave.close();
    viewManager.hideDrawing();
  });

  dialogBtnCancel.addEventListener("click", () => {
    dialogSave.close();
  });
}

function initInputHandlersForPoints() {
  let selectedPoint: Point | null = null;

  // Handle clicking: Either select an existing point OR add a new one
  canvas.addEventListener("mousedown", (event) => {
    // Get mouse coordinates relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left - translateX;
    const mouseY = event.clientY - rect.top - translateY;
    const clickVec = new Vector(mouseX, mouseY);

    // Closest point to click
    let closestPoint = null;
    let closestDist = Infinity;

    for (const point of state.points) {
      const distSqr = point.pos.distSq(clickVec);
      if (distSqr < closestDist) {
        closestPoint = point;
        closestDist = distSqr;
      }
    }

    if (closestDist < 20 * 20 && closestPoint) {
      if (mode == "delete") {
        deletePoint(closestPoint);
      } else {
        selectedPoint = closestPoint;
        selectedPoint.selected = true;
      }
    } else if (mode == "add") {
      addPoint(clickVec);
    }
  });

  canvas.addEventListener("mousemove", (event) => {
    if (selectedPoint) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left - translateX;
      const mouseY = event.clientY - rect.top - translateY;
      selectedPoint.pos = new Vector(mouseX, mouseY);
    }
  });

  canvas.addEventListener("mouseup", () => {
    if (selectedPoint) {
      selectedPoint.selected = false;
      selectedPoint = null;
    }
  });

  canvas.addEventListener("mouseleave", () => {
    if (selectedPoint) {
      selectedPoint.selected = false;
      selectedPoint = null;
    }
  });
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
    }
  }
}

function addPoint(at: Vector) {
  if (state.points.length > 0) {
    const lastPoint = state.points.at(-1)!;
    let lastControlPointVector = new Vector(
      lastPoint.pos.x + 20,
      lastPoint.pos.y,
    );
    if (!lastPoint.is_constrol_point) {
      lastControlPointVector = new Vector(
        lastPoint.pos.x,
        lastPoint.pos.y - 60,
      );
    }
    const point = new Point(at);
    const controlPointLast = new Point(lastControlPointVector);
    const controlPointCur = new Point(new Vector(at.x, at.y - 60));
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
  ctx.fillStyle = "rgba(40,40,40,1)";
  ctx.fillRect(-translateX, -translateY, WORLD_WIDTH, WORLD_HEIGHT);
}

function draw(curTime: number) {
  clearCanvas();
  const deltaTime = Math.min(curTime - state.lastTime, 50) / 1000;
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

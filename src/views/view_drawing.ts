import { saveDrawing } from "../drawing/drawing_utils";
import { viewManager } from "../main";
import ComplexFunction from "../math/complex_function";
import Vector from "../math/vector";
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
    saveDrawing(name, state.curve.toSimpleArray());
    simulateState.function = ComplexFunction.fromBezierCurvePoints(
      state.curve.toSimpleArray(),
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

  canvas.addEventListener("mousedown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left - translateX;
    const mouseY = event.clientY - rect.top - translateY;
    const clickVec = new Vector(mouseX, mouseY);

    let closestPointIdx = state.curve.getClosestPointIndex(clickVec);
    if (closestPointIdx != -1) {
      if (mode == "delete") {
        state.curve.deletePoint(closestPointIdx);
      } else {
        selectedPoint = closestPointIdx;
        state.curve.selectPoint(selectedPoint); // <-- Updated
      }
    } else if (mode == "add") {
      state.curve.addPoint(clickVec);
    }
  });

  canvas.addEventListener("mousemove", (event) => {
    if (selectedPoint != -1) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left - translateX;
      const mouseY = event.clientY - rect.top - translateY;
      const mouseClickVec = new Vector(mouseX, mouseY);

      state.curve.movePoint(selectedPoint, mouseClickVec); // <-- Updated

      const closestPoint = state.curve.getClosestPointIndex(
        mouseClickVec,
        10,
        selectedPoint,
      );
      if (closestPoint == selectedClosestPoint) return;

      if (selectedClosestPoint != -1)
        state.curve.deselectPoint(selectedClosestPoint); // <-- Updated
      if (closestPoint != -1) state.curve.selectPoint(closestPoint); // <-- Updated

      selectedClosestPoint = closestPoint;
    }
  });

  canvas.addEventListener("mouseup", () => {
    if (selectedPoint != -1) {
      state.curve.deselectPoint(selectedPoint);
      if (selectedClosestPoint != -1) {
        state.curve.deselectPoint(selectedClosestPoint);

        if (
          (selectedPoint == 0 &&
            selectedClosestPoint == state.curve.length - 2) ||
          (selectedPoint == state.curve.length - 2 && selectedClosestPoint == 0)
        ) {
          state.curve.alignLoopEnds(selectedClosestPoint, selectedPoint);
        }

        // Snap to the closest point's position
        const targetPos = state.curve.points[selectedClosestPoint].pos;
        state.curve.movePoint(selectedPoint, targetPos); // <-- Updated

        selectedClosestPoint = -1;
      }
      selectedPoint = -1;
    }
  });

  canvas.addEventListener("mouseleave", () => {
    if (selectedPoint != -1) {
      state.curve.deselectPoint(selectedPoint);
      selectedPoint = -1;
    }
  });
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
  const pts = state.curve.points;
  if (pts.length == 2) {
    pts[0].draw(ctx);
    return;
  }
  for (const point of pts) {
    // Note: Make sure this matches your Point class (is_constrol_point vs isControlPoint)
    if (point.isControlPoint) point.color = "red";
    point.draw(ctx);
  }
}

function drawBezier() {
  const pts = state.curve.points;
  if (pts.length <= 1) return;

  // draw bezier
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;
  ctx.beginPath();

  // Fixed the typo here (.x, .y)
  ctx.moveTo(pts[0].pos.x, pts[0].pos.y);
  ctx.bezierCurveTo(
    pts[1].pos.x,
    pts[1].pos.y,
    pts[3].pos.x,
    pts[3].pos.y,
    pts[2].pos.x,
    pts[2].pos.y,
  );

  for (let i = 2; i < pts.length - 4; i += 3) {
    ctx.moveTo(pts[i].pos.x, pts[i].pos.y);
    ctx.bezierCurveTo(
      pts[i + 2].pos.x,
      pts[i + 2].pos.y,
      pts[i + 4].pos.x,
      pts[i + 4].pos.y,
      pts[i + 3].pos.x,
      pts[i + 3].pos.y,
    );
  }
  ctx.stroke();

  // draw lines
  ctx.strokeStyle = "gray";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pts[0].pos.x, pts[0].pos.y);
  ctx.lineTo(pts[1].pos.x, pts[1].pos.y);

  for (let i = 2; i < pts.length - 1; i += 3) {
    ctx.moveTo(pts[i].pos.x, pts[i].pos.y);
    ctx.lineTo(pts[i + 1].pos.x, pts[i + 1].pos.y);
    if (i + 2 < pts.length) {
      ctx.moveTo(pts[i].pos.x, pts[i].pos.y);
      ctx.lineTo(pts[i + 2].pos.x, pts[i + 2].pos.y);
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

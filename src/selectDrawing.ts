import {
  deleteDrawing,
  getSavedDrawings,
  toBezierPoints,
  type Drawing,
} from "./drawing-utils";
import ComplexFunction from "./function";
import { viewManager } from "./main";
import { drawingState, simulateState } from "./state";

export function initView() {
  initInputHandlers();
  initDrawingItems();
}

export function destroyView() {
  const items = document.querySelector(".items") as HTMLDivElement;
  items.replaceChildren();
}

function initInputHandlers() {
  const btnClose = document.querySelector(
    ".select-drawing .controls button.close",
  ) as HTMLButtonElement;
  btnClose.addEventListener("click", (event) => {
    viewManager.hideSelectDrawing();
  });
}

function initDrawingItems() {
  const createItem = addItem(0, "+", "Create", null);
  createItem.addEventListener("click", () => {
    drawingState.points = [];
    viewManager.showDrawing();
    viewManager.hideSelectDrawing();
  });
  const drawings = getSavedDrawings();
  for (let i = 0; i < drawings.length; i++) {
    const item = addItem(
      i + 1,
      (i + 1).toString(),
      drawings[i].name,
      drawings[i],
    );
    item.dataset.key = drawings[i].key;
    item.addEventListener("click", () => {
      console.log("loading", drawings[i].name);
      simulateState.function = ComplexFunction.fromBezierCurvePoints(
        drawings[i].points,
      );
      viewManager.showSimulate();
      viewManager.hideSelectDrawing();
    });
  }
}

function addItem(
  idx: number,
  indexText: string,
  nameText: string,
  drawing: Drawing | null,
) {
  const items = document.querySelector(".items") as HTMLElement;

  const item = document.createElement("div");
  item.className = "item";
  item.dataset.idx = idx.toString();

  const index = document.createElement("div");
  index.className = "index";
  index.textContent = indexText;

  const name = document.createElement("div");
  name.className = "name";
  name.textContent = nameText;

  // --- actions container ---
  const actions = document.createElement("div");
  actions.className = "item-actions";

  const makeIconBtn = (src: string, cls: string) => {
    const btn = document.createElement("button");
    btn.className = `icon-btn ${cls}`;
    btn.type = "button";

    const img = document.createElement("img");
    img.src = src;
    img.alt = cls;

    btn.appendChild(img);
    return btn;
  };

  const deleteBtn = makeIconBtn("../public/delete.svg", "delete");
  const editBtn = makeIconBtn("../public/edit.svg", "edit");

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    items.removeChild(item);
    deleteDrawing(item.dataset.key!);
  });

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    drawingState.points = toBezierPoints(drawing!.points);
    viewManager.showDrawing();
    viewManager.hideSelectDrawing();
  });
  actions.append(editBtn, deleteBtn);
  index.appendChild(actions);

  item.append(index, name);
  items.appendChild(item);

  return item;
}

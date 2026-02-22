import {
  initView as initDrawingView,
  destroyView as destroyDrawingView,
} from "./drawing";
import {
  destroyView as destroySelectDrawingView,
  initView as initSelectDrawingView,
} from "./selectDrawing";
import {
  destroyView as destroySimulateView,
  initView as initSimulateView,
} from "./simulate";

const SELECT_DRAWING_VIEW = ".select-drawing";
const DRAWING_VIEW = ".drawing";
const SIMULATE_VIEW = ".simulate";

export class ViewManager {
  private selectDrawing = document.querySelector(
    SELECT_DRAWING_VIEW,
  ) as HTMLElement;
  private drawing = document.querySelector(DRAWING_VIEW) as HTMLElement;
  private simulate = document.querySelector(SIMULATE_VIEW) as HTMLElement;

  private show(el: HTMLElement) {
    el.style.display = "block";
  }

  private hide(el: HTMLElement) {
    el.style.display = "none";
  }

  showSelectDrawing() {
    this.show(this.selectDrawing);
    initSelectDrawingView();
  }
  hideSelectDrawing() {
    this.hide(this.selectDrawing);
    destroySelectDrawingView();
  }

  showDrawing() {
    this.show(this.drawing);
    initDrawingView();
  }
  hideDrawing() {
    this.hide(this.drawing);
    destroyDrawingView();
  }

  showSimulate() {
    this.show(this.simulate);
    initSimulateView();
  }
  hideSimulate() {
    this.hide(this.simulate);
    destroySimulateView();
  }
}

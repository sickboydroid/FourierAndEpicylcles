import { ViewManager } from "./views";

export const viewManager = new ViewManager();
const btnLoadPath = document.querySelector(
  "#load-new-path",
) as HTMLButtonElement;
btnLoadPath.addEventListener("click", () => {
  viewManager.hideDrawing();
  viewManager.showSelectDrawing();
});

viewManager.showSimulate();

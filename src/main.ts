import { initAudio } from "./audio/audio_manager";
import { savePremadeDrawings } from "./utils/drawing-utils";
import { ViewManager } from "./views/view_manager";

export const viewManager = new ViewManager();
const btnLoadPath = document.getElementById("change-function")!;

btnLoadPath.addEventListener("click", () => {
  viewManager.hideDrawing();
  viewManager.showSelectDrawing();
});

savePremadeDrawings();
viewManager.showSimulate();
initAudio();

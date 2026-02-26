import { savePremadeDrawings } from "./drawing-utils";
import { ViewManager } from "./views";

export const viewManager = new ViewManager();
const musicToggleBtn = document.getElementById("music-toggle")!;
const btnLoadPath = document.getElementById("load-new-path")!;

btnLoadPath.addEventListener("click", () => {
  viewManager.hideDrawing();
  viewManager.showSelectDrawing();
});

const musicFiles = ["music/track1.mp3", "music/track2.mp3", "music/track3.mp3"];

let currentIndex = Math.floor(Math.random() * musicFiles.length);
const bgMusic = new Audio(musicFiles[currentIndex]);

bgMusic.addEventListener("ended", () => {
  currentIndex = (currentIndex + 1) % musicFiles.length;
  bgMusic.src = musicFiles[currentIndex];
  bgMusic.play().catch(() => {});
});

bgMusic.addEventListener("pause", updateMusicToggleBtn);
bgMusic.addEventListener("play", updateMusicToggleBtn);

musicToggleBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (bgMusic.paused) {
    bgMusic.play().catch(() => {});
  } else {
    bgMusic.pause();
  }
});

savePremadeDrawings();
viewManager.showSimulate();
initAudio();
updateMusicToggleBtn();

async function initAudio() {
  try {
    await bgMusic.play();
    updateMusicToggleBtn();
  } catch {
    document.addEventListener(
      "click",
      () => {
        if (bgMusic.paused) {
          updateMusicToggleBtn();
          bgMusic.play().catch(() => {});
        }
      },
      { once: true },
    );
  }
}

function updateMusicToggleBtn() {
  if (bgMusic.paused) musicToggleBtn.textContent = "Unmute";
  else musicToggleBtn.textContent = "Mute";
}

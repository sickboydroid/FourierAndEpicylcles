const musicToggleBtn = document.getElementById("music-toggle") as HTMLButtonElement;
const musicFiles = ["music/track1.opus", "music/track2.opus", "music/track3.opus"];

let currentIndex = Math.floor(Math.random() * musicFiles.length);
const bgMusic = new Audio();
bgMusic.preload = "auto"; // Force background buffering

// Tracks manual mute state to prevent unwanted auto-play on track change
let isUserMuted = false;

bgMusic.addEventListener("waiting", () => {
  musicToggleBtn.disabled = true;
  musicToggleBtn.textContent = "Buffering...";
});

bgMusic.addEventListener("canplaythrough", () => {
  musicToggleBtn.disabled = false;
  updateMusicToggleBtn();
  
  if (bgMusic.paused && !isUserMuted) {
    bgMusic.play().catch(() => { /* Ignore autoplay block */ });
  }
});

bgMusic.addEventListener("ended", () => {
  currentIndex = (currentIndex + 1) % musicFiles.length;
  musicToggleBtn.disabled = true;
  musicToggleBtn.textContent = "Loading Track...";
  bgMusic.src = musicFiles[currentIndex]; 
  bgMusic.load(); // Fetch the next track
});

bgMusic.addEventListener("pause", updateMusicToggleBtn);
bgMusic.addEventListener("play", updateMusicToggleBtn);

function updateMusicToggleBtn() {
  if (musicToggleBtn.disabled) return; // Preserve "Buffering..." text
  musicToggleBtn.textContent = bgMusic.paused ? "Unmute" : "Mute";
}

musicToggleBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  if (bgMusic.paused) {
    isUserMuted = false;
    bgMusic.play().catch(() => {});
  } else {
    isUserMuted = true;
    bgMusic.pause();
  }
});

export async function initAudio() {
  musicToggleBtn.disabled = true;
  musicToggleBtn.textContent = "Loading...";
  
  bgMusic.src = musicFiles[currentIndex];
  bgMusic.load();

  // Handle browser autoplay policies requiring initial user interaction
  document.addEventListener("click", async () => {
      if (!bgMusic.paused || isUserMuted) return;
      try {
        await bgMusic.play();
      } catch (error) {
        console.log("Autoplay blocked.");
      }
    },
    { once: true }
  );
}
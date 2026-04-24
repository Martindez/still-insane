const ambientMusic = document.getElementById("ambientMusic");
const playBtn = document.getElementById("playBtn");
const readBtn = document.getElementById("readBtn");
const muteBtn = document.getElementById("muteBtn");
const readPanel = document.getElementById("readPanel");
const closeReadBtn = document.getElementById("closeReadBtn");

let muted = localStorage.getItem("rabbitEscapeMuted") === "true";
let musicStarted = false;

if (ambientMusic) {
  ambientMusic.volume = 0.35;
  ambientMusic.muted = muted;
}

function updateMuteButton() {
  muteBtn.textContent = muted ? "Unmute" : "Mute";
}

function startMusic() {
  if (!ambientMusic || muted || musicStarted) return;

  ambientMusic.play()
    .then(() => {
      musicStarted = true;
    })
    .catch(() => {});
}

function toggleMute() {
  muted = !muted;
  localStorage.setItem("rabbitEscapeMuted", muted);

  if (ambientMusic) {
    ambientMusic.muted = muted;

    if (muted) {
      ambientMusic.pause();
      musicStarted = false;
    } else {
      startMusic();
    }
  }

  updateMuteButton();
}

function startGame() {
  startMusic();

  setTimeout(() => {
    window.location.href = "./school/";
  }, 200);
}

function openReadMe() {
  readPanel.classList.add("show");
}

function closeReadMe() {
  readPanel.classList.remove("show");
}

document.addEventListener("click", startMusic);
document.addEventListener("touchstart", startMusic);

playBtn.addEventListener("click", startGame);
readBtn.addEventListener("click", openReadMe);
muteBtn.addEventListener("click", toggleMute);
closeReadBtn.addEventListener("click", closeReadMe);

readPanel.addEventListener("click", (event) => {
  if (event.target === readPanel) {
    closeReadMe();
  }
});

updateMuteButton();
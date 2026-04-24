const menuMusic = document.getElementById("menuMusic");
const playBtn = document.getElementById("playBtn");
const readBtn = document.getElementById("readBtn");
const muteBtn = document.getElementById("muteBtn");
const readPanel = document.getElementById("readPanel");
const closeReadBtn = document.getElementById("closeReadBtn");

let muted = localStorage.getItem("rabbitEscapeMuted") === "true";
let musicStarted = false;

menuMusic.volume = 0.5;
menuMusic.muted = muted;

function updateMuteButton() {
  muteBtn.textContent = muted ? "Unmute" : "Mute";
}

function startMusic() {
  if (muted || musicStarted) return;

  menuMusic.play()
    .then(() => {
      musicStarted = true;
    })
    .catch(() => {});
}

function toggleMute() {
  muted = !muted;
  menuMusic.muted = muted;
  localStorage.setItem("rabbitEscapeMuted", muted);

  if (muted) {
    menuMusic.pause();
  } else {
    startMusic();
  }

  updateMuteButton();
}

function startGame() {
  window.location.href = "./school/";
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
const menuMusic = document.getElementById("menuMusic");
const muteBtn = document.getElementById("muteBtn");

let muted = false;

function playGame() {
  window.location.href = "school/index.html";
}

function toggleMute() {
  muted = !muted;
  menuMusic.muted = muted;

  if (muted) {
    muteBtn.textContent = "UNMUTE";
  } else {
    muteBtn.textContent = "MUTE";
  }
}

function openReadMe() {
  alert(
    "STILL INSANE: EDDERKOPPEN\n\n" +
    "Find a way out.\n" +
    "Avoid the killer.\n" +
    "Use your flashlight.\n" +
    "Do not get caught."
  );
}
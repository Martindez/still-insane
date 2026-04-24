const menuMusic = document.getElementById("menuMusic");
const muteBtn = document.getElementById("muteBtn");

let muted = false;
let audioUnlocked = false;

function unlockAudio() {
  if (audioUnlocked) return;

  audioUnlocked = true;
  menuMusic.muted = false;
  menuMusic.volume = 0.45;

  menuMusic.play().catch(() => {
    console.log("Audio will start after user interaction.");
  });

  muteBtn.textContent = "MUTE";
}

function playGame() {
  unlockAudio();

  setTimeout(() => {
    window.location.href = "school/index.html";
  }, 300);
}

function toggleMute() {
  unlockAudio();

  muted = !muted;
  menuMusic.muted = muted;

  muteBtn.textContent = muted ? "UNMUTE" : "MUTE";
}

function openReadMe() {
  unlockAudio();

  alert(
    "STILL INSANE: EDDERKOPPEN\n\n" +
    "Find a way out.\n" +
    "Avoid the killer.\n" +
    "Use your flashlight.\n" +
    "Do not get caught."
  );
}
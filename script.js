const menuMusic = document.getElementById("menuMusic");
const muteBtn = document.getElementById("muteBtn");

let musicStarted = false;

document.addEventListener("pointerdown", startMusicOnce);
document.addEventListener("click", startMusicOnce);
document.addEventListener("touchstart", startMusicOnce);

function startMusicOnce() {
  const muted = localStorage.getItem("rabbitEscapeMuted") === "true";

  if (!menuMusic || muted) return;

  musicStarted = true;
  menuMusic.muted = false;
  menuMusic.volume = 0.35;

  menuMusic.play().catch((err) => {
    console.log("Menu music blocked until interaction:", err);
  });
}

function playGame() {
  startMusicOnce();

  setTimeout(() => {
    window.location.href = "./school/";
  }, 250);
}

function toggleMute() {
  const muted = localStorage.getItem("rabbitEscapeMuted") === "true";
  const newMutedState = !muted;

  localStorage.setItem("rabbitEscapeMuted", String(newMutedState));

  if (newMutedState) {
    if (menuMusic) {
      menuMusic.pause();
      menuMusic.muted = true;
    }

    if (muteBtn) muteBtn.textContent = "UNMUTE";
  } else {
    if (menuMusic) {
      menuMusic.muted = false;
      menuMusic.volume = 0.35;
      menuMusic.play().catch((err) => {
        console.log("Music blocked:", err);
      });
    }

    if (muteBtn) muteBtn.textContent = "MUTE";
  }
}

function loadMuteState() {
  const muted = localStorage.getItem("rabbitEscapeMuted") === "true";

  if (muteBtn) {
    muteBtn.textContent = muted ? "UNMUTE" : "MUTE";
  }

  if (menuMusic) {
    menuMusic.muted = muted;
  }
}

function openReadMe() {
  startMusicOnce();

  if (document.getElementById("readmeOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "readmeOverlay";

  overlay.innerHTML = `
    <div class="readme-box">
      <h2>STILL INSANE</h2>
      <p class="small-text">A school project by Martin</p>

      <h3>HOW TO PLAY</h3>
      <p>Escape all 3 levels while being hunted by the killer.</p>

      <ul>
        <li>Click or tap connected rooms to move.</li>
        <li>Collect all keys in each level.</li>
        <li>When all keys are collected, the exit opens.</li>
        <li>Reach the exit to complete the level.</li>
        <li>If the killer reaches your room, you lose.</li>
      </ul>

      <h3>LEVELS</h3>
      <p>
        Level 1: School<br>
        Level 2: Pizzaria<br>
        Level 3: Edderkoppen
      </p>

      <h3>CONTROLS</h3>
      <p>
        PLAY starts the game.<br>
        MUTE turns music on or off.<br>
        READ ME opens this guide.
      </p>

      <h3>GOAL</h3>
      <p>Survive all three levels and escape Still Insane.</p>

      <button class="close-readme" type="button" onclick="closeReadMe()">CLOSE</button>
    </div>
  `;

  document.body.appendChild(overlay);
}

function closeReadMe() {
  const overlay = document.getElementById("readmeOverlay");
  if (overlay) overlay.remove();
}

loadMuteState();
const menuMusic = document.getElementById("menuMusic");
const muteBtn = document.getElementById("muteBtn");

document.addEventListener("pointerdown", startMusicOnce, { once: true });

function startMusicOnce() {
  const muted = localStorage.getItem("rabbitEscapeMuted") === "true";

  if (muted) return;

  if (menuMusic) {
    menuMusic.volume = 0.35;
    menuMusic.play().catch(() => {});
  }
}

function playGame() {
  window.location.href = "./school/";
}

function toggleMute() {
  const currentlyMuted =
    localStorage.getItem("rabbitEscapeMuted") === "true";

  if (currentlyMuted) {
    localStorage.setItem("rabbitEscapeMuted", "false");

    if (menuMusic) {
      menuMusic.muted = false;
      menuMusic.play().catch(() => {});
    }

    muteBtn.textContent = "MUTE";
  } else {
    localStorage.setItem("rabbitEscapeMuted", "true");

    if (menuMusic) {
      menuMusic.pause();
      menuMusic.muted = true;
    }

    muteBtn.textContent = "UNMUTE";
  }
}

function loadMuteState() {
  const muted = localStorage.getItem("rabbitEscapeMuted") === "true";

  if (muted) {
    muteBtn.textContent = "UNMUTE";

    if (menuMusic) {
      menuMusic.pause();
      menuMusic.muted = true;
    }
  } else {
    muteBtn.textContent = "MUTE";
  }
}

function openReadMe() {
  if (document.getElementById("readmeOverlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "readmeOverlay";

  overlay.innerHTML = `
    <div class="readme-box">
      <h2>STILL INSANE</h2>
      <p class="small-text">A school project by Martin</p>

      <h3>HOW TO PLAY</h3>
      <p>
        Escape all 3 levels while being hunted by the killer.
      </p>

      <ul>
        <li>Tap / Click rooms to move</li>
        <li>Collect all keys</li>
        <li>Unlock the exit</li>
        <li>Avoid the killer</li>
      </ul>

      <h3>LEVELS</h3>
      <p>
        1. School<br>
        2. Pizzaria<br>
        3. Edderkoppen
      </p>

      <h3>DANGER</h3>
      <p>
        The killer moves every time you move.
        If he reaches your room, you lose.
      </p>

      <button class="close-readme" onclick="closeReadMe()">CLOSE</button>
    </div>
  `;

  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.85)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";
  overlay.style.padding = "20px";

  document.body.appendChild(overlay);

  const box = overlay.querySelector(".readme-box");

  box.style.maxWidth = "520px";
  box.style.width = "100%";
  box.style.background = "#111";
  box.style.border = "2px solid #d81f26";
  box.style.borderRadius = "18px";
  box.style.padding = "26px";
  box.style.color = "white";
  box.style.fontFamily = "Arial, Helvetica, sans-serif";
  box.style.boxShadow = "0 0 25px rgba(255,0,0,0.25)";
  box.style.textAlign = "center";

  overlay.querySelector("h2").style.marginTop = "0";
  overlay.querySelector("h2").style.fontSize = "2rem";
  overlay.querySelector("h2").style.color = "#ff2b33";

  overlay.querySelector(".small-text").style.color = "#ccc";
  overlay.querySelector(".small-text").style.marginBottom = "20px";

  overlay.querySelectorAll("h3").forEach((h3) => {
    h3.style.marginBottom = "8px";
    h3.style.marginTop = "18px";
    h3.style.color = "#ffd66b";
  });

  overlay.querySelectorAll("p").forEach((p) => {
    p.style.lineHeight = "1.5";
  });

  overlay.querySelector("ul").style.textAlign = "left";
  overlay.querySelector("ul").style.paddingLeft = "24px";
  overlay.querySelector("ul").style.lineHeight = "1.7";

  const btn = overlay.querySelector(".close-readme");

  btn.style.marginTop = "18px";
  btn.style.background = "#d81f26";
  btn.style.color = "white";
  btn.style.border = "0";
  btn.style.padding = "12px 24px";
  btn.style.borderRadius = "12px";
  btn.style.fontWeight = "900";
  btn.style.cursor = "pointer";
}

function closeReadMe() {
  const overlay = document.getElementById("readmeOverlay");

  if (overlay) overlay.remove();
}

loadMuteState();
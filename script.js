const menuMusic = document.getElementById("menuMusic");
const muteBtn = document.getElementById("muteBtn");

const characterOverlay = document.getElementById("characterOverlay");
const readmeOverlay = document.getElementById("readmeOverlay");
const levelOverlay = document.getElementById("levelOverlay");

const selectedCharacterPreview = document.getElementById("selectedCharacterPreview");
const selectedCharacterName = document.getElementById("selectedCharacterName");

const characters = {
  "player.png": "Alansius",
  "player2.png": "Pascorali",
  "player3.png": "Rumi"
};

function initMenu() {
  const savedCharacter = localStorage.getItem("stillInsaneCharacter") || "player.png";
  const forcedName = characters[savedCharacter] || "Alansius";

  localStorage.setItem("stillInsaneCharacterName", forcedName);

  updateCharacterPreview(savedCharacter, forcedName);
  updateMuteButton();

  document.addEventListener("click", startMenuMusic);
  document.addEventListener("touchstart", startMenuMusic);
}

function startMenuMusic() {
  const muted = localStorage.getItem("stillInsaneMuted") === "true";
  if (!menuMusic || muted) return;

  menuMusic.volume = 0.35;
  menuMusic.muted = false;
  menuMusic.play().catch(() => {});
}

function playGame() {
  startMenuMusic();
  window.location.href = "./school/";
}

function toggleMute() {
  const muted = localStorage.getItem("stillInsaneMuted") === "true";
  const newMuted = !muted;

  localStorage.setItem("stillInsaneMuted", String(newMuted));

  if (menuMusic) {
    menuMusic.muted = newMuted;

    if (newMuted) {
      menuMusic.pause();
    } else {
      startMenuMusic();
    }
  }

  updateMuteButton();
}

function updateMuteButton() {
  const muted = localStorage.getItem("stillInsaneMuted") === "true";

  if (muteBtn) {
    muteBtn.textContent = muted ? "UNMUTE" : "MUTE";
  }
}

function openCharacterSelect() {
  if (!characterOverlay) return;
  characterOverlay.classList.remove("hidden");
  markSelectedCharacter();
}

function closeCharacterSelect() {
  if (!characterOverlay) return;
  characterOverlay.classList.add("hidden");
}

function selectCharacter(fileName) {
  const realName = characters[fileName] || "Alansius";

  localStorage.setItem("stillInsaneCharacter", fileName);
  localStorage.setItem("stillInsaneCharacterName", realName);

  updateCharacterPreview(fileName, realName);
  markSelectedCharacter();
}

function updateCharacterPreview(fileName, characterName) {
  if (selectedCharacterPreview) {
    selectedCharacterPreview.src = `assets/${fileName}`;
  }

  if (selectedCharacterName) {
    selectedCharacterName.textContent = characterName;
  }
}

function markSelectedCharacter() {
  const savedCharacter = localStorage.getItem("stillInsaneCharacter") || "player.png";
  const cards = document.querySelectorAll(".character-card");

  cards.forEach((card) => {
    const img = card.querySelector("img");
    const src = img ? img.getAttribute("src") : "";

    card.classList.toggle("selected", src.includes(savedCharacter));
  });
}

function openLevelSelect() {
  if (!levelOverlay) return;
  levelOverlay.classList.remove("hidden");
}

function closeLevelSelect() {
  if (!levelOverlay) return;
  levelOverlay.classList.add("hidden");
}

function goToLevel(level) {
  startMenuMusic();
  window.location.href = `./${level}/`;
}

function openReadMe() {
  if (!readmeOverlay) return;
  readmeOverlay.classList.remove("hidden");
}

function closeReadMe() {
  if (!readmeOverlay) return;
  readmeOverlay.classList.add("hidden");
}

initMenu();
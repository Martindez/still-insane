const menuMusic = document.getElementById("menuMusic");
const muteBtn = document.getElementById("muteBtn");

const characterOverlay = document.getElementById("characterOverlay");
const readmeOverlay = document.getElementById("readmeOverlay");

const selectedCharacterPreview = document.getElementById("selectedCharacterPreview");
const selectedCharacterName = document.getElementById("selectedCharacterName");

const characters = {
  "player.png": "Alansius",
  "player2.png": "Pascorali",
  "player3.png": "Rumi"
};

function initMenu() {
  const savedCharacter =
    localStorage.getItem("stillInsaneCharacter") || "player.png";

  const forcedName = characters[savedCharacter] || "Alansius";

  localStorage.setItem("stillInsaneCharacterName", forcedName);

  updateCharacterPreview(savedCharacter, forcedName);
  updateMuteButton();

  document.addEventListener("click", startMenuMusic);
  document.addEventListener("touchstart", startMenuMusic);
}

function startMenuMusic() {
  const muted = localStorage.getItem("rabbitEscapeMuted") === "true";
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
  const muted = localStorage.getItem("rabbitEscapeMuted") === "true";
  const newMuted = !muted;

  localStorage.setItem("rabbitEscapeMuted", String(newMuted));

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
  const muted = localStorage.getItem("rabbitEscapeMuted") === "true";
  muteBtn.textContent = muted ? "UNMUTE" : "MUTE";
}

function openCharacterSelect() {
  characterOverlay.classList.remove("hidden");
  markSelectedCharacter();
}

function closeCharacterSelect() {
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
  selectedCharacterPreview.src = `assets/${fileName}`;
  selectedCharacterName.textContent = characterName;
}

function markSelectedCharacter() {
  const savedCharacter =
    localStorage.getItem("stillInsaneCharacter") || "player.png";

  const cards = document.querySelectorAll(".character-card");

  cards.forEach((card) => {
    const img = card.querySelector("img");
    const src = img ? img.getAttribute("src") : "";

    card.classList.toggle("selected", src.includes(savedCharacter));
  });
}

function openReadMe() {
  readmeOverlay.classList.remove("hidden");
}

function closeReadMe() {
  readmeOverlay.classList.add("hidden");
}

initMenu();
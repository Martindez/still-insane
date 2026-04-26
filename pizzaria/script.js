const rooms = {
  Kitchen: ["Storage", "Arcade"],
  Storage: ["Kitchen", "Dining", "Staff"],
  Staff: ["Storage", "Bath"],
  Arcade: ["Kitchen", "Dining", "Delivery"],
  Dining: ["Storage", "Arcade", "Bath", "Oven"],
  Bath: ["Staff", "Dining", "Exit"],
  Delivery: ["Arcade", "Oven"],
  Oven: ["Dining", "Delivery", "Exit"],
  Exit: ["Bath", "Oven"]
};

const roomPositions = {
  Kitchen: { top: 18, left: 18 },
  Storage: { top: 18, left: 50 },
  Staff: { top: 18, left: 82 },
  Arcade: { top: 49, left: 18 },
  Dining: { top: 49, left: 50 },
  Bath: { top: 49, left: 82 },
  Delivery: { top: 80, left: 18 },
  Oven: { top: 80, left: 50 },
  Exit: { top: 80, left: 82 }
};

const possibleKeyRooms = [
  "Kitchen",
  "Storage",
  "Staff",
  "Arcade",
  "Dining",
  "Bath",
  "Delivery",
  "Oven"
];

const totalKeys = 5;

let gameState = {
  playerRoom: "Dining",
  killerRoom: "Storage",
  keyRooms: [],
  collectedKeys: [],
  hearts: 1,
  gameStarted: false
};

let audioContext = null;
let playerLight = null;

const ui = {
  ambientMusic: document.getElementById("ambientMusic"),
  jumpscareSound: document.getElementById("jumpscareSound"),
  hud: document.getElementById("hud"),
  gameWrap: document.getElementById("gameWrap"),
  endScreen: document.getElementById("endScreen"),
  restartBtn: document.getElementById("restartBtn"),
  nextLevelBtn: document.getElementById("nextLevelBtn"),
  menuBtn: document.getElementById("menuBtn"),
  keyCount: document.getElementById("keyCount"),
  hearts: document.getElementById("hearts"),
  playerRoom: document.getElementById("playerRoom"),
  killerRoom: document.getElementById("killerRoom"),
  exitState: document.getElementById("exitState"),
  messageText: document.getElementById("messageText"),
  endTitle: document.getElementById("endTitle"),
  endText: document.getElementById("endText"),
  playerToken: document.getElementById("playerToken"),
  killerToken: document.getElementById("killerToken"),
  keyLayer: document.getElementById("keyLayer"),
  flashOverlay: document.getElementById("flashOverlay"),
  jumpscareOverlay: document.getElementById("jumpscareOverlay"),
  mapBoard: document.querySelector(".map-board"),
  roomButtons: document.querySelectorAll(".room-hotspot")
};

if (ui.restartBtn) {
  ui.restartBtn.addEventListener("click", startGame);
}

if (ui.nextLevelBtn) {
  ui.nextLevelBtn.addEventListener("click", () => {
    window.location.href = "../edderkoppen/";
  });
}

if (ui.menuBtn) {
  ui.menuBtn.addEventListener("click", () => {
    window.location.href = "../";
  });
}

ui.roomButtons.forEach((button) => {
  button.addEventListener("click", () => {
    startAmbientMusic();
    movePlayer(button.dataset.room);
  });
});

document.addEventListener("pointerdown", startAmbientMusic);

function startAmbientMusic() {
  const muted = localStorage.getItem("rabbitEscapeMuted") === "true";
  if (!ui.ambientMusic || muted) return;

  ui.ambientMusic.volume = 0.35;
  ui.ambientMusic.muted = false;
  ui.ambientMusic.play().catch(() => {});
}

function stopAmbientMusic() {
  if (!ui.ambientMusic) return;

  ui.ambientMusic.pause();
  ui.ambientMusic.currentTime = 0;
}

function playJumpscareSound() {
  if (!ui.jumpscareSound) return;

  ui.jumpscareSound.currentTime = 0;
  ui.jumpscareSound.volume = 0.85;
  ui.jumpscareSound.play().catch(() => {});
}

function createPlayerLight() {
  if (playerLight || !ui.mapBoard) return;

  playerLight = document.createElement("div");
  playerLight.className = "player-light";
  ui.mapBoard.appendChild(playerLight);
}

function initAudio() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioContext = new AudioCtx();
  }

  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playTone(frequency, duration, type = "sine", volume = 0.04) {
  if (!audioContext) return;

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start(now);
  osc.stop(now + duration);
}

function startGame() {
  initAudio();
  startAmbientMusic();
  createPlayerLight();
  loadSelectedCharacter();

  gameState = {
    playerRoom: "Dining",
    killerRoom: "Storage",
    keyRooms: shuffle([...possibleKeyRooms]).slice(0, totalKeys),
    collectedKeys: [],
    hearts: 1,
    gameStarted: true
  };

  if (ui.endScreen) ui.endScreen.classList.add("hidden");
  if (ui.hud) ui.hud.classList.remove("hidden");
  if (ui.gameWrap) ui.gameWrap.classList.remove("hidden");
  if (ui.nextLevelBtn) ui.nextLevelBtn.classList.add("hidden");

  showMessage("Find all 5 keys, then go to the Exit.");
  updateUI();
}

function movePlayer(room) {
  if (!gameState.gameStarted) return;

  const connectedRooms = rooms[gameState.playerRoom];

  if (!connectedRooms.includes(room)) {
    showMessage("You can only move to connected rooms.");
    playTone(130, 0.15, "square", 0.03);
    return;
  }

  if (room === "Exit" && gameState.collectedKeys.length < totalKeys) {
    showMessage("The Exit is locked. Find all keys first.");
    playTone(130, 0.15, "square", 0.03);
    return;
  }

  gameState.playerRoom = room;
  playTone(440, 0.08, "triangle", 0.035);

  collectKeyIfNeeded();
  moveKiller();
  checkDanger();
  checkWin();
  updateUI();
}

function collectKeyIfNeeded() {
  const room = gameState.playerRoom;

  if (gameState.keyRooms.includes(room) && !gameState.collectedKeys.includes(room)) {
    gameState.collectedKeys.push(room);
    showMessage(`You found a key in ${room}!`);
    playTone(740, 0.1, "triangle", 0.05);
    setTimeout(() => playTone(940, 0.12, "triangle", 0.05), 90);
  }
}

function moveKiller() {
  const options = rooms[gameState.killerRoom].filter((room) => room !== "Exit");
  gameState.killerRoom = options[Math.floor(Math.random() * options.length)];
}

function checkDanger() {
  if (gameState.playerRoom === gameState.killerRoom) {
    gameState.hearts = 0;
    flash();
    playJumpscareSound();
    showJumpscare();
    loseGame();
  }
}

function checkWin() {
  if (gameState.playerRoom === "Exit" && gameState.collectedKeys.length >= totalKeys) {
    gameState.gameStarted = false;

    if (ui.endTitle) ui.endTitle.textContent = "You Escaped!";
    if (ui.endText) ui.endText.textContent = "You escaped the pizzaria. Next stop: Edderkoppen.";
    if (ui.nextLevelBtn) ui.nextLevelBtn.classList.remove("hidden");
    if (ui.hud) ui.hud.classList.add("hidden");
    if (ui.gameWrap) ui.gameWrap.classList.add("hidden");
    if (ui.endScreen) ui.endScreen.classList.remove("hidden");

    playTone(523, 0.12, "triangle", 0.05);
    setTimeout(() => playTone(659, 0.12, "triangle", 0.05), 120);
    setTimeout(() => playTone(784, 0.18, "triangle", 0.05), 240);
  }
}

function loseGame() {
  gameState.gameStarted = false;
  stopAmbientMusic();

  if (ui.endTitle) ui.endTitle.textContent = "Caught!";
  if (ui.endText) ui.endText.textContent = "The killer rabbit found you.";
  if (ui.nextLevelBtn) ui.nextLevelBtn.classList.add("hidden");
  if (ui.hud) ui.hud.classList.add("hidden");
  if (ui.gameWrap) ui.gameWrap.classList.add("hidden");

  setTimeout(() => {
    if (ui.endScreen) ui.endScreen.classList.remove("hidden");
  }, 900);
}

function updateUI() {
  if (ui.keyCount) ui.keyCount.textContent = gameState.collectedKeys.length;
  if (ui.hearts) ui.hearts.textContent = gameState.hearts > 0 ? "❤️" : "💔";
  if (ui.playerRoom) ui.playerRoom.textContent = gameState.playerRoom;
  if (ui.killerRoom) ui.killerRoom.textContent = gameState.killerRoom;
  if (ui.exitState) {
    ui.exitState.textContent = gameState.collectedKeys.length >= totalKeys ? "Open" : "Locked";
  }

  moveToken(ui.playerToken, gameState.playerRoom);
  moveToken(ui.killerToken, gameState.killerRoom);
  moveLight(gameState.playerRoom);
  drawKeys();
}

function moveToken(token, room) {
  if (!token) return;

  const pos = roomPositions[room];
  token.style.top = `${pos.top}%`;
  token.style.left = `${pos.left}%`;
  animateToken(token);
}

function animateToken(token) {
  token.classList.remove("moving");
  void token.offsetWidth;
  token.classList.add("moving");
}

function moveLight(room) {
  if (!playerLight) return;

  const pos = roomPositions[room];
  playerLight.style.top = `${pos.top}%`;
  playerLight.style.left = `${pos.left}%`;
}

function drawKeys() {
  if (!ui.keyLayer) return;

  ui.keyLayer.innerHTML = "";

  gameState.keyRooms.forEach((room) => {
    if (gameState.collectedKeys.includes(room)) return;

    const pos = roomPositions[room];
    const key = document.createElement("div");
    key.className = "map-key";
    key.style.top = `${pos.top + 5}%`;
    key.style.left = `${pos.left + 5}%`;
    ui.keyLayer.appendChild(key);
  });
}

function showMessage(text) {
  if (ui.messageText) ui.messageText.textContent = text;
}

function flash() {
  if (!ui.flashOverlay) return;

  ui.flashOverlay.classList.remove("active");
  void ui.flashOverlay.offsetWidth;
  ui.flashOverlay.classList.add("active");
}

function showJumpscare() {
  if (!ui.jumpscareOverlay) return;

  ui.jumpscareOverlay.classList.remove("hidden");
  setTimeout(() => {
    ui.jumpscareOverlay.classList.add("hidden");
  }, 900);
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function loadSelectedCharacter() {
  const character = localStorage.getItem("stillInsaneCharacter") || "player.png";

  if (ui.playerToken) {
    ui.playerToken.src = `../assets/${character}`;
  }
}
startGame();

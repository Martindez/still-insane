const rooms = {
  Electrical: ["Gym", "Security"],
  Gym: ["Electrical", "Kitchen", "Playground"],
  Kitchen: ["Gym", "Playground"],
  Security: ["Electrical", "Playground"],
  Playground: ["Security", "Gym", "Kitchen", "Exit"],
  Exit: ["Playground"]
};

/* Centered positions for player, killer, keys, and flashlight */
const roomPositions = {
  Electrical: { top: 22, left: 20 },
  Gym: { top: 22, left: 50 },
  Kitchen: { top: 22, left: 80 },
  Security: { top: 58, left: 18 },
  Playground: { top: 58, left: 50 },
  Exit: { top: 79, left: 50 }
};

const possibleKeyRooms = ["Electrical", "Gym", "Kitchen", "Security", "Playground"];
const totalKeys = 4;

let gameState = {
  playerRoom: "Playground",
  killerRoom: "Kitchen",
  keyRooms: [],
  collectedKeys: [],
  hearts: 3,
  gameStarted: false
};

let audioContext = null;
let playerLight = null;

const ui = {
  startScreen: document.getElementById("startScreen"),
  hud: document.getElementById("hud"),
  gameWrap: document.getElementById("gameWrap"),
  endScreen: document.getElementById("endScreen"),
  startBtn: document.getElementById("startBtn"),
  restartBtn: document.getElementById("restartBtn"),
  nextLevelBtn: document.getElementById("nextLevelBtn"),
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

ui.startBtn.addEventListener("click", startGame);
ui.restartBtn.addEventListener("click", resetGame);
ui.nextLevelBtn.addEventListener("click", () => {
  window.location.href = "../pizzaria/";
});

ui.roomButtons.forEach((button) => {
  button.addEventListener("click", () => movePlayer(button.dataset.room));
});

function createPlayerLight() {
  if (playerLight) return;

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
  createPlayerLight();

  gameState = {
    playerRoom: "Playground",
    killerRoom: "Kitchen",
    keyRooms: shuffle([...possibleKeyRooms]).slice(0, totalKeys),
    collectedKeys: [],
    hearts: 3,
    gameStarted: true
  };

  ui.startScreen.classList.add("hidden");
  ui.endScreen.classList.add("hidden");
  ui.hud.classList.remove("hidden");
  ui.gameWrap.classList.remove("hidden");

  showMessage("Find all 4 keys, then go to the Exit.");
  updateUI();
}

function resetGame() {
  startGame();
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
    gameState.hearts -= 1;
    flash();
    showJumpscare();
    playTone(120, 0.25, "sawtooth", 0.06);

    if (gameState.hearts <= 0) {
      loseGame();
    } else {
      gameState.playerRoom = "Playground";
      gameState.killerRoom = "Kitchen";
      showMessage("The rabbit caught you! You escaped back to the Playground.");
    }
  }
}

function checkWin() {
  if (gameState.playerRoom === "Exit" && gameState.collectedKeys.length >= totalKeys) {
    gameState.gameStarted = false;
    ui.endTitle.textContent = "You Escaped!";
    ui.endText.textContent = "You escaped the school. Next stop: Pizzaria.";
    ui.nextLevelBtn.classList.remove("hidden");
    ui.hud.classList.add("hidden");
    ui.gameWrap.classList.add("hidden");
    ui.endScreen.classList.remove("hidden");
    playTone(523, 0.12, "triangle", 0.05);
    setTimeout(() => playTone(659, 0.12, "triangle", 0.05), 120);
    setTimeout(() => playTone(784, 0.18, "triangle", 0.05), 240);
  }
}

function loseGame() {
  gameState.gameStarted = false;
  ui.endTitle.textContent = "Game Over";
  ui.endText.textContent = "The killer rabbit caught you too many times.";
  ui.nextLevelBtn.classList.add("hidden");
  ui.hud.classList.add("hidden");
  ui.gameWrap.classList.add("hidden");
  ui.endScreen.classList.remove("hidden");
}

function updateUI() {
  ui.keyCount.textContent = gameState.collectedKeys.length;
  ui.hearts.textContent = "❤️ ".repeat(gameState.hearts).trim();
  ui.playerRoom.textContent = gameState.playerRoom;
  ui.killerRoom.textContent = gameState.killerRoom;
  ui.exitState.textContent = gameState.collectedKeys.length >= totalKeys ? "Open" : "Locked";

  moveToken(ui.playerToken, gameState.playerRoom);
  moveToken(ui.killerToken, gameState.killerRoom);
  moveLight(gameState.playerRoom);
  drawKeys();
}

function moveToken(token, room) {
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
  ui.messageText.textContent = text;
}

function flash() {
  ui.flashOverlay.classList.remove("active");
  void ui.flashOverlay.offsetWidth;
  ui.flashOverlay.classList.add("active");
}

function showJumpscare() {
  ui.jumpscareOverlay.classList.remove("hidden");
  setTimeout(() => {
    ui.jumpscareOverlay.classList.add("hidden");
  }, 650);
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

createPlayerLight();
updateUI();
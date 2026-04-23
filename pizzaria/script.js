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
const bestTimeStorageKey = "rabbitEscapePizzariaBestTime";

const roomPositions = {
  Kitchen: { top: 12, left: 16 },
  Storage: { top: 12, left: 50 },
  Staff: { top: 12, left: 84 },
  Arcade: { top: 45, left: 16 },
  Dining: { top: 45, left: 50 },
  Bath: { top: 45, left: 84 },
  Delivery: { top: 82, left: 16 },
  Oven: { top: 82, left: 50 },
  Exit: { top: 82, left: 84 }
};

const roomKeySpawnAreas = {
  Kitchen: [
    { top: 10, left: 12 },
    { top: 12, left: 18 },
    { top: 14, left: 15 },
    { top: 13, left: 20 },
    { top: 11, left: 16 }
  ],
  Storage: [
    { top: 10, left: 46 },
    { top: 12, left: 53 },
    { top: 14, left: 49 },
    { top: 13, left: 56 },
    { top: 11, left: 50 }
  ],
  Staff: [
    { top: 10, left: 80 },
    { top: 12, left: 86 },
    { top: 14, left: 83 },
    { top: 13, left: 88 },
    { top: 11, left: 84 }
  ],
  Arcade: [
    { top: 42, left: 12 },
    { top: 45, left: 18 },
    { top: 48, left: 15 },
    { top: 46, left: 20 },
    { top: 44, left: 16 }
  ],
  Dining: [
    { top: 42, left: 45 },
    { top: 45, left: 54 },
    { top: 48, left: 49 },
    { top: 46, left: 57 },
    { top: 44, left: 50 }
  ],
  Bath: [
    { top: 42, left: 80 },
    { top: 45, left: 87 },
    { top: 48, left: 83 },
    { top: 46, left: 89 },
    { top: 44, left: 84 }
  ],
  Delivery: [
    { top: 79, left: 12 },
    { top: 82, left: 18 },
    { top: 85, left: 15 },
    { top: 83, left: 21 },
    { top: 81, left: 16 }
  ],
  Oven: [
    { top: 79, left: 46 },
    { top: 82, left: 53 },
    { top: 85, left: 49 },
    { top: 83, left: 56 },
    { top: 81, left: 50 }
  ]
};

let gameState = {
  playerRoom: "Dining",
  killerRoom: "Storage",
  keyRooms: [],
  keyVisualPositions: {},
  collectedKeys: [],
  hearts: 3,
  maxHearts: 3,
  gameStarted: false,
  startTime: 0,
  lastWarningTime: 0,
  safeTurns: 0
};

let audioContext = null;

const ui = {
  startScreen: document.getElementById("startScreen"),
  hud: document.getElementById("hud"),
  gameWrap: document.getElementById("gameWrap"),
  messageBox: document.getElementById("messageBox"),
  endScreen: document.getElementById("endScreen"),

  endTitle: document.getElementById("endTitle"),
  endText: document.getElementById("endText"),
  endTime: document.getElementById("endTime"),
  endHearts: document.getElementById("endHearts"),
  endKeys: document.getElementById("endKeys"),
  endBestTime: document.getElementById("endBestTime"),
  endEyebrow: document.getElementById("endEyebrow"),

  goalText: document.getElementById("goalText"),
  exitStateText: document.getElementById("exitState"),
  keyCountText: document.getElementById("keyCount"),
  heartsText: document.getElementById("hearts"),
  dangerText: document.getElementById("dangerText"),
  playerRoomText: document.getElementById("playerRoom"),
  killerRoomText: document.getElementById("killerRoom"),
  bestTimeText: document.getElementById("bestTime"),
  dangerBar: document.getElementById("dangerBar"),
  messageText: document.getElementById("messageText"),

  playerToken: document.getElementById("playerToken"),
  killerToken: document.getElementById("killerToken"),
  flashOverlay: document.getElementById("flashOverlay"),
  jumpscareOverlay: document.getElementById("jumpscareOverlay"),
  keyLayer: document.getElementById("keyLayer"),

  startBtn: document.getElementById("startBtn"),
  restartBtn: document.getElementById("restartBtn"),
  roomButtons: document.querySelectorAll(".room-hotspot"),
  roomRings: document.querySelectorAll(".room-ring")
};

ui.startBtn.addEventListener("click", startGame);
ui.restartBtn.addEventListener("click", resetGame);

ui.roomButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!gameState.gameStarted) return;
    movePlayer(button.dataset.room);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  hardHideJumpscare();
  updateUI();
});

function initAudio() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }

  if (audioContext && audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playTone(frequency, duration, type = "sine", volume = 0.05, fade = 0.02) {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  const now = audioContext.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);

  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + duration + fade);
}

function playMoveSound() {
  playTone(430, 0.08, "triangle", 0.035);
}

function playKeySound() {
  playTone(700, 0.08, "triangle", 0.05);
  setTimeout(() => playTone(920, 0.12, "triangle", 0.045), 70);
}

function playWarningSound() {
  playTone(210, 0.1, "sawtooth", 0.05);
  setTimeout(() => playTone(180, 0.1, "sawtooth", 0.045), 80);
}

function playHitSound() {
  playTone(170, 0.12, "sawtooth", 0.06);
  setTimeout(() => playTone(110, 0.16, "sawtooth", 0.055), 70);
}

function playWinSound() {
  playTone(523, 0.12, "triangle", 0.05);
  setTimeout(() => playTone(659, 0.12, "triangle", 0.05), 100);
  setTimeout(() => playTone(784, 0.18, "triangle", 0.05), 200);
}

function playLockedSound() {
  playTone(150, 0.12, "square", 0.04);
}

function flashScreen(type = "warning") {
  if (!ui.flashOverlay) return;

  ui.flashOverlay.classList.remove("active", "warning");
  void ui.flashOverlay.offsetWidth;
  ui.flashOverlay.classList.add(type);
}

function shakeScreen() {
  document.body.classList.remove("shake");
  void document.body.offsetWidth;
  document.body.classList.add("shake");
}

function hardHideJumpscare() {
  if (!ui.jumpscareOverlay) return;

  ui.jumpscareOverlay.classList.add("hidden");
  ui.jumpscareOverlay.style.display = "none";
  ui.jumpscareOverlay.style.visibility = "hidden";
  ui.jumpscareOverlay.style.pointerEvents = "none";
  ui.jumpscareOverlay.setAttribute("aria-hidden", "true");
}

function showJumpscareOverlay() {
  if (!ui.jumpscareOverlay) return;

  ui.jumpscareOverlay.classList.remove("hidden");
  ui.jumpscareOverlay.style.display = "flex";
  ui.jumpscareOverlay.style.visibility = "visible";
  ui.jumpscareOverlay.style.pointerEvents = "auto";
  ui.jumpscareOverlay.setAttribute("aria-hidden", "false");
}

function showJumpscare(duration = 650) {
  if (!ui.jumpscareOverlay) return Promise.resolve();

  showJumpscareOverlay();
  shakeScreen();

  return new Promise((resolve) => {
    setTimeout(() => {
      hardHideJumpscare();
      resolve();
    }, duration);
  });
}

function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function getBestTime() {
  return localStorage.getItem(bestTimeStorageKey);
}

function setBestTime(seconds) {
  const currentBest = getBestTime();
  if (!currentBest || seconds < Number(currentBest)) {
    localStorage.setItem(bestTimeStorageKey, String(seconds));
  }
}

function assignRandomKeys() {
  gameState.keyRooms = shuffle(possibleKeyRooms).slice(0, totalKeys);
  gameState.keyVisualPositions = {};

  gameState.keyRooms.forEach((room) => {
    const spawnOptions = shuffle(roomKeySpawnAreas[room]);
    gameState.keyVisualPositions[room] = spawnOptions[0];
  });
}

function resetRoundState() {
  gameState.playerRoom = "Dining";
  gameState.killerRoom = "Storage";
  gameState.collectedKeys = [];
  gameState.hearts = gameState.maxHearts;
  gameState.safeTurns = 0;
  gameState.startTime = 0;
  gameState.lastWarningTime = 0;
}

function startGame() {
  initAudio();
  hardHideJumpscare();
  assignRandomKeys();
  resetRoundState();

  gameState.gameStarted = true;
  gameState.startTime = Date.now();

  ui.startScreen.classList.add("hidden");
  ui.hud.classList.remove("hidden");
  ui.gameWrap.classList.remove("hidden");
  ui.messageBox.classList.remove("hidden");
  ui.endScreen.classList.add("hidden");

  showMessage("Goal: Collect all 5 glowing keys, then reach the Exit.");
  updateUI();
}

function resetGame() {
  hardHideJumpscare();

  gameState.gameStarted = false;
  gameState.keyRooms = [];
  gameState.keyVisualPositions = {};
  resetRoundState();

  ui.startScreen.classList.remove("hidden");
  ui.hud.classList.add("hidden");
  ui.gameWrap.classList.add("hidden");
  ui.messageBox.classList.add("hidden");
  ui.endScreen.classList.add("hidden");

  renderKeys();
  showMessage("Press Start to begin.");
  updateUI();
}

function movePlayer(targetRoom) {
  if (!rooms[gameState.playerRoom].includes(targetRoom)) {
    showMessage("You can only move to connected glowing rooms.");
    return;
  }

  gameState.playerRoom = targetRoom;
  playMoveSound();

  if (gameState.safeTurns > 0) {
    gameState.safeTurns -= 1;
  }

  checkForKeyPickup();

  if (gameState.playerRoom === "Exit" && !exitIsOpen()) {
    showMessage("The Exit is locked. Collect all 5 keys first.");
    playLockedSound();
  } else if (
    !gameState.collectedKeys.includes(gameState.playerRoom) ||
    !gameState.keyRooms.includes(gameState.playerRoom)
  ) {
    if (!(gameState.playerRoom === "Exit" && exitIsOpen())) {
      showMessage(`You moved to ${gameState.playerRoom}.`);
    }
  }

  if (gameState.safeTurns === 0 && gameState.playerRoom === gameState.killerRoom) {
    playerHit();
    return;
  }

  moveKiller();

  if (gameState.safeTurns === 0 && gameState.playerRoom === gameState.killerRoom) {
    playerHit();
    return;
  }

  if (gameState.playerRoom === "Exit" && exitIsOpen()) {
    winGame();
    return;
  }

  maybeShowDangerWarning();
  updateUI();
}

function checkForKeyPickup() {
  const currentRoom = gameState.playerRoom;

  if (
    gameState.keyRooms.includes(currentRoom) &&
    !gameState.collectedKeys.includes(currentRoom)
  ) {
    gameState.collectedKeys.push(currentRoom);
    playKeySound();

    if (gameState.collectedKeys.length === gameState.keyRooms.length) {
      showMessage("All 5 keys collected! The Exit is OPEN!");
    } else {
      const keysLeft = gameState.keyRooms.length - gameState.collectedKeys.length;
      showMessage(`You found a key in ${currentRoom}. ${keysLeft} key${keysLeft === 1 ? "" : "s"} left.`);
    }
  }
}

function moveKiller() {
  if (gameState.safeTurns > 0 && Math.random() < 0.55) {
    return;
  }

  const path = shortestPath(gameState.killerRoom, gameState.playerRoom);

  if (path.length > 1 && Math.random() < 0.85) {
    gameState.killerRoom = path[1];
  } else {
    const choices = rooms[gameState.killerRoom];
    gameState.killerRoom = choices[Math.floor(Math.random() * choices.length)];
  }
}

function shortestPath(start, goal) {
  const queue = [[start]];
  const visited = new Set([start]);

  while (queue.length) {
    const path = queue.shift();
    const current = path[path.length - 1];

    if (current === goal) return path;

    for (const next of rooms[current]) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push([...path, next]);
      }
    }
  }

  return [start];
}

function getDistance(a, b) {
  return Math.max(0, shortestPath(a, b).length - 1);
}

function exitIsOpen() {
  return gameState.collectedKeys.length === gameState.keyRooms.length && gameState.keyRooms.length > 0;
}

async function playerHit() {
  if (!gameState.gameStarted) return;

  gameState.hearts -= 1;
  playHitSound();
  flashScreen("active");
  await showJumpscare();

  if (gameState.hearts <= 0) {
    loseGame();
    return;
  }

  gameState.playerRoom = "Dining";
  gameState.safeTurns = 1;

  showMessage(
    `Caught! You lost 1 heart. ${gameState.hearts} heart${gameState.hearts === 1 ? "" : "s"} left. Safe for 1 move.`
  );
  updateUI();
}

function loseGame() {
  hardHideJumpscare();
  gameState.gameStarted = false;

  ui.hud.classList.add("hidden");
  ui.gameWrap.classList.add("hidden");
  ui.messageBox.classList.add("hidden");
  ui.endScreen.classList.remove("hidden");

  ui.endEyebrow.textContent = "GAME OVER";
  ui.endTitle.textContent = "You Were Caught!";
  ui.endText.textContent = "The killer rabbit got you in the pizzaria.";
  ui.endTime.textContent = "--";
  ui.endHearts.textContent = "0";
  ui.endKeys.textContent = `${gameState.collectedKeys.length}/${totalKeys}`;

  const best = getBestTime();
  ui.endBestTime.textContent = best ? `${best}s` : "--";
}

function winGame() {
  hardHideJumpscare();
  gameState.gameStarted = false;

  ui.hud.classList.add("hidden");
  ui.gameWrap.classList.add("hidden");
  ui.messageBox.classList.add("hidden");
  ui.endScreen.classList.remove("hidden");

  const totalSeconds = Math.floor((Date.now() - gameState.startTime) / 1000);
  setBestTime(totalSeconds);
  playWinSound();

  ui.endEyebrow.textContent = "ROUND COMPLETE";
  ui.endTitle.textContent = "You Escaped!";
  ui.endText.textContent = "You got all 5 keys and escaped the pizzaria.";
  ui.endTime.textContent = `${totalSeconds}s`;
  ui.endHearts.textContent = `${gameState.hearts}`;
  ui.endKeys.textContent = `${gameState.collectedKeys.length}/${totalKeys}`;

  const best = getBestTime();
  ui.endBestTime.textContent = best ? `${best}s` : "--";

  updateBestTime();
}

function updateBestTime() {
  const best = getBestTime();
  ui.bestTimeText.textContent = best ? `${best}s` : "--";
}

function updateDanger() {
  const distance = getDistance(gameState.playerRoom, gameState.killerRoom);

  let label = "Low";
  let width = 18;

  if (distance === 0) {
    label = "Caught";
    width = 100;
  } else if (distance === 1) {
    label = "High";
    width = 85;
  } else if (distance === 2) {
    label = "Medium";
    width = 58;
  }

  if (gameState.safeTurns > 0) {
    label = "Safe";
    width = 12;
  }

  ui.dangerText.textContent = label;
  ui.dangerBar.style.width = `${width}%`;
}

function updateHearts() {
  ui.heartsText.textContent = "❤️ ".repeat(gameState.hearts).trim();
}

function updateGoalStatus() {
  if (!gameState.gameStarted) {
    ui.goalText.textContent = "Find 5 keys";
    ui.exitStateText.textContent = "Locked";
    return;
  }

  if (exitIsOpen()) {
    ui.goalText.textContent = "Reach the Exit";
    ui.exitStateText.textContent = "OPEN";
  } else {
    const keysLeft = gameState.keyRooms.length - gameState.collectedKeys.length;
    ui.goalText.textContent = `Find ${keysLeft} more key${keysLeft === 1 ? "" : "s"}`;
    ui.exitStateText.textContent = "Locked";
  }
}

function setTokenPosition(token, roomName) {
  const position = roomPositions[roomName];
  token.style.top = `${position.top}%`;
  token.style.left = `${position.left}%`;
}

function renderKeys() {
  if (!ui.keyLayer) return;
  ui.keyLayer.innerHTML = "";

  gameState.keyRooms.forEach((room) => {
    if (gameState.collectedKeys.includes(room)) return;

    const keyPosition = gameState.keyVisualPositions[room];
    if (!keyPosition) return;

    const keyElement = document.createElement("div");
    keyElement.className = "map-key";
    keyElement.style.top = `${keyPosition.top}%`;
    keyElement.style.left = `${keyPosition.left}%`;
    keyElement.title = `${room} key`;

    ui.keyLayer.appendChild(keyElement);
  });
}

function updateBoard() {
  ui.roomButtons.forEach((button) => {
    const room = button.dataset.room;
    button.classList.remove("connected", "locked");

    if (room === gameState.playerRoom) {
      button.classList.add("locked");
      button.disabled = true;
    } else if (rooms[gameState.playerRoom].includes(room)) {
      button.classList.add("connected");
      button.disabled = false;
    } else {
      button.classList.add("locked");
      button.disabled = true;
    }
  });

  ui.roomRings.forEach((ring) => {
    const room = ring.dataset.ring;
    ring.classList.remove("connected", "current", "killer-room", "exit-open", "safe-turn");

    if (room === gameState.playerRoom) {
      if (gameState.safeTurns > 0) {
        ring.classList.add("safe-turn");
      } else {
        ring.classList.add("current");
      }
    } else if (rooms[gameState.playerRoom].includes(room)) {
      ring.classList.add("connected");
    }

    if (room === gameState.killerRoom) {
      ring.classList.add("killer-room");
    }

    if (room === "Exit" && exitIsOpen()) {
      ring.classList.add("exit-open");
    }
  });

  setTokenPosition(ui.playerToken, gameState.playerRoom);
  setTokenPosition(ui.killerToken, gameState.killerRoom);
  renderKeys();
}

function maybeShowDangerWarning() {
  if (gameState.safeTurns > 0) return;

  const distance = getDistance(gameState.playerRoom, gameState.killerRoom);
  const now = Date.now();

  if (distance === 1 && now - gameState.lastWarningTime > 1200) {
    showMessage("Warning: The killer is very close!");
    playWarningSound();
    flashScreen("warning");
    gameState.lastWarningTime = now;
  } else if (exitIsOpen() && gameState.playerRoom !== "Exit") {
    showMessage("All keys collected! Run to the Exit!");
  }
}

function updateUI() {
  ui.keyCountText.textContent = gameState.collectedKeys.length;
  ui.playerRoomText.textContent = gameState.playerRoom;
  ui.killerRoomText.textContent = gameState.killerRoom;
  updateHearts();
  updateBestTime();
  updateGoalStatus();
  updateBoard();
  updateDanger();
}

function showMessage(text) {
  ui.messageText.textContent = text;
}

hardHideJumpscare();
updateUI();
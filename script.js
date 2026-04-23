const rooms = {
  Electrical: ["Gym", "Playground"],
  Gym: ["Electrical", "Kitchen", "Playground"],
  Kitchen: ["Gym", "Security"],
  Security: ["Kitchen", "Playground", "Exit"],
  Playground: ["Electrical", "Gym", "Security"],
  Exit: ["Security"]
};

const possibleKeyRooms = ["Electrical", "Gym", "Kitchen", "Security", "Playground"];
const totalKeys = 4;

const roomPositions = {
  Electrical: { top: 18, left: 20 },
  Gym: { top: 18, left: 50 },
  Kitchen: { top: 18, left: 80 },
  Security: { top: 52, left: 14 },
  Playground: { top: 56, left: 50 },
  Exit: { top: 83, left: 50 }
};

let playerRoom = "Playground";
let killerRoom = "Security";
let keyRooms = [];
let collectedKeys = [];
let hearts = 3;
let maxHearts = 3;
let gameStarted = false;
let startTime = 0;
let lastWarningTime = 0;
let audioContext = null;

const startScreen = document.getElementById("startScreen");
const hud = document.getElementById("hud");
const gameWrap = document.getElementById("gameWrap");
const messageBox = document.getElementById("messageBox");
const endScreen = document.getElementById("endScreen");
const endTitle = document.getElementById("endTitle");
const endText = document.getElementById("endText");
const endTime = document.getElementById("endTime");
const endHearts = document.getElementById("endHearts");
const endKeys = document.getElementById("endKeys");
const endBestTime = document.getElementById("endBestTime");
const endEyebrow = document.getElementById("endEyebrow");

const goalText = document.getElementById("goalText");
const exitStateText = document.getElementById("exitState");
const keyCountText = document.getElementById("keyCount");
const heartsText = document.getElementById("hearts");
const dangerText = document.getElementById("dangerText");
const playerRoomText = document.getElementById("playerRoom");
const killerRoomText = document.getElementById("killerRoom");
const bestTimeText = document.getElementById("bestTime");
const dangerBar = document.getElementById("dangerBar");
const messageText = document.getElementById("messageText");

const playerToken = document.getElementById("playerToken");
const killerToken = document.getElementById("killerToken");
const flashOverlay = document.getElementById("flashOverlay");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const nextLevelBtn = document.getElementById("nextLevelBtn");
const roomButtons = document.querySelectorAll(".room-marker");

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", resetGame);

if (nextLevelBtn) {
  nextLevelBtn.addEventListener("click", () => {
    window.location.href = "/rabbit-escape-school/pizzaria/";
  });
}

roomButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!gameStarted) return;
    movePlayer(button.dataset.room);
  });
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

  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const now = audioContext.currentTime;

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(audioContext.destination);

  osc.start(now);
  osc.stop(now + duration + fade);
}

function playMoveSound() {
  playTone(420, 0.09, "triangle", 0.035);
}

function playKeySound() {
  playTone(660, 0.08, "triangle", 0.045);
  setTimeout(() => playTone(880, 0.12, "triangle", 0.04), 70);
}

function playWarningSound() {
  playTone(240, 0.11, "sawtooth", 0.045);
  setTimeout(() => playTone(200, 0.11, "sawtooth", 0.04), 90);
}

function playHitSound() {
  playTone(180, 0.12, "sawtooth", 0.06);
  setTimeout(() => playTone(120, 0.18, "sawtooth", 0.055), 70);
}

function playWinSound() {
  playTone(523, 0.12, "triangle", 0.05);
  setTimeout(() => playTone(659, 0.12, "triangle", 0.05), 100);
  setTimeout(() => playTone(784, 0.18, "triangle", 0.05), 200);
}

function flashScreen(type = "warning") {
  if (!flashOverlay) return;
  flashOverlay.classList.remove("active", "warning");
  void flashOverlay.offsetWidth;
  flashOverlay.classList.add(type);
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function assignRandomKeys() {
  keyRooms = shuffle(possibleKeyRooms).slice(0, totalKeys);
}

function startGame() {
  initAudio();
  assignRandomKeys();
  playerRoom = "Playground";
  killerRoom = "Security";
  collectedKeys = [];
  hearts = maxHearts;
  gameStarted = true;
  startTime = Date.now();
  lastWarningTime = 0;

  startScreen.classList.add("hidden");
  hud.classList.remove("hidden");
  gameWrap.classList.remove("hidden");
  messageBox.classList.remove("hidden");
  endScreen.classList.add("hidden");

  if (nextLevelBtn) {
    nextLevelBtn.classList.add("hidden");
  }

  showMessage("Goal: Collect all 4 keys, then reach the Exit.");
  updateUI();
}

function resetGame() {
  playerRoom = "Playground";
  killerRoom = "Security";
  keyRooms = [];
  collectedKeys = [];
  hearts = maxHearts;
  gameStarted = false;
  startTime = 0;
  lastWarningTime = 0;

  startScreen.classList.remove("hidden");
  hud.classList.add("hidden");
  gameWrap.classList.add("hidden");
  messageBox.classList.add("hidden");
  endScreen.classList.add("hidden");

  if (nextLevelBtn) {
    nextLevelBtn.classList.add("hidden");
  }

  showMessage("Press Start to begin.");
  updateUI();
}

function movePlayer(targetRoom) {
  if (!rooms[playerRoom].includes(targetRoom)) {
    showMessage("You can only move to connected rooms.");
    return;
  }

  playerRoom = targetRoom;
  playMoveSound();

  if (keyRooms.includes(playerRoom) && !collectedKeys.includes(playerRoom)) {
    collectedKeys.push(playerRoom);
    playKeySound();

    if (collectedKeys.length === keyRooms.length) {
      showMessage("All 4 keys collected! The Exit is OPEN!");
      playTone(980, 0.16, "triangle", 0.05);
    } else {
      const keysLeft = keyRooms.length - collectedKeys.length;
      showMessage(`You found a key in ${playerRoom}. ${keysLeft} key left.`);
    }
  } else if (playerRoom === "Exit" && !exitIsOpen()) {
    showMessage("The Exit is locked. Collect all 4 keys first.");
    playTone(150, 0.12, "square", 0.04);
  } else {
    showMessage(`You moved to ${playerRoom}.`);
  }

  if (playerRoom === killerRoom) {
    playerHit();
    if (!gameStarted) return;
  }

  moveKiller();

  if (playerRoom === killerRoom) {
    playerHit();
    if (!gameStarted) return;
  }

  if (playerRoom === "Exit" && exitIsOpen()) {
    winGame();
    return;
  }

  maybeShowDangerWarning();
  updateUI();
}

function moveKiller() {
  const path = shortestPath(killerRoom, playerRoom);

  if (path.length > 1 && Math.random() < 0.88) {
    killerRoom = path[1];
  } else {
    const choices = rooms[killerRoom];
    killerRoom = choices[Math.floor(Math.random() * choices.length)];
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
  return collectedKeys.length === keyRooms.length;
}

function playerHit() {
  hearts -= 1;
  playHitSound();
  flashScreen("active");

  if (hearts <= 0) {
    loseGame();
    return;
  }

  playerRoom = "Playground";
  showMessage(`Caught! You lost 1 heart. ${hearts} heart${hearts === 1 ? "" : "s"} left. Back to Playground.`);
  updateUI();
}

function loseGame() {
  gameStarted = false;
  hud.classList.add("hidden");
  gameWrap.classList.add("hidden");
  messageBox.classList.add("hidden");
  endScreen.classList.remove("hidden");

  endEyebrow.textContent = "GAME OVER";
  endTitle.textContent = "You Were Caught!";
  endText.textContent = "The killer rabbit caught you 3 times.";
  endTime.textContent = "--";
  endHearts.textContent = "0";
  endKeys.textContent = `${collectedKeys.length}/${totalKeys}`;
  endBestTime.textContent = localStorage.getItem("rabbitEscapeBestTime") ? `${localStorage.getItem("rabbitEscapeBestTime")}s` : "--";

  if (nextLevelBtn) {
    nextLevelBtn.classList.add("hidden");
  }
}

function winGame() {
  gameStarted = false;
  hud.classList.add("hidden");
  gameWrap.classList.add("hidden");
  messageBox.classList.add("hidden");
  endScreen.classList.remove("hidden");

  const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
  const best = localStorage.getItem("rabbitEscapeBestTime");

  if (!best || totalSeconds < Number(best)) {
    localStorage.setItem("rabbitEscapeBestTime", String(totalSeconds));
  }

  playWinSound();

  endEyebrow.textContent = "ROUND COMPLETE";
  endTitle.textContent = "You Escaped!";
  endText.textContent = "You got all 4 keys and escaped the school.";
  endTime.textContent = `${totalSeconds}s`;
  endHearts.textContent = `${hearts}`;
  endKeys.textContent = `${collectedKeys.length}/${totalKeys}`;
  endBestTime.textContent = `${localStorage.getItem("rabbitEscapeBestTime")}s`;

  if (nextLevelBtn) {
    nextLevelBtn.classList.remove("hidden");
  }

  updateBestTime();
}

function updateBestTime() {
  const best = localStorage.getItem("rabbitEscapeBestTime");
  bestTimeText.textContent = best ? `${best}s` : "--";
}

function updateDanger() {
  const d = getDistance(playerRoom, killerRoom);

  let label = "Low";
  let width = 20;

  if (d === 0) {
    label = "Caught";
    width = 100;
  } else if (d === 1) {
    label = "High";
    width = 88;
  } else if (d === 2) {
    label = "Medium";
    width = 58;
  }

  dangerText.textContent = label;
  dangerBar.style.width = `${width}%`;
}

function updateHearts() {
  heartsText.textContent = "❤️ ".repeat(hearts).trim();
}

function updateGoalStatus() {
  if (!gameStarted) {
    goalText.textContent = "Find 4 keys";
    exitStateText.textContent = "Locked";
    return;
  }

  if (exitIsOpen()) {
    goalText.textContent = "Reach the Exit";
    exitStateText.textContent = "OPEN";
  } else {
    const keysLeft = keyRooms.length - collectedKeys.length;
    goalText.textContent = `Find ${keysLeft} more key${keysLeft === 1 ? "" : "s"}`;
    exitStateText.textContent = "Locked";
  }
}

function setTokenPosition(token, roomName) {
  token.style.top = `${roomPositions[roomName].top}%`;
  token.style.left = `${roomPositions[roomName].left}%`;
}

function updateBoard() {
  roomButtons.forEach((button) => {
    const room = button.dataset.room;

    button.classList.remove(
      "connected",
      "locked",
      "current",
      "killer-room",
      "exit-open",
      "room-cleared",
      "key-room"
    );

    if (room === playerRoom) {
      button.classList.add("current");
      button.disabled = true;
    } else if (rooms[playerRoom].includes(room)) {
      button.classList.add("connected");
      button.disabled = false;
    } else {
      button.classList.add("locked");
      button.disabled = true;
    }

    if (room === killerRoom) {
      button.classList.add("killer-room");
    }

    if (collectedKeys.includes(room)) {
      button.classList.add("room-cleared");
    }

    if (keyRooms.includes(room) && !collectedKeys.includes(room)) {
      button.classList.add("key-room");
    }

    if (room === "Exit" && exitIsOpen()) {
      button.classList.add("exit-open");
    }
  });

  setTokenPosition(playerToken, playerRoom);
  setTokenPosition(killerToken, killerRoom);
}

function maybeShowDangerWarning() {
  const d = getDistance(playerRoom, killerRoom);
  const now = Date.now();

  if (d === 1 && now - lastWarningTime > 1200) {
    showMessage("Warning: The killer is very close!");
    playWarningSound();
    flashScreen("warning");
    lastWarningTime = now;
  } else if (exitIsOpen() && playerRoom !== "Exit") {
    showMessage("All keys collected! Run to the Exit!");
  }
}

function updateUI() {
  keyCountText.textContent = collectedKeys.length;
  playerRoomText.textContent = playerRoom;
  killerRoomText.textContent = killerRoom;
  updateHearts();
  updateBestTime();
  updateGoalStatus();
  updateBoard();
  updateDanger();
}

function showMessage(text) {
  messageText.textContent = text;
}

updateUI();

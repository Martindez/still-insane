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

const allRooms = ["Kitchen", "Storage", "Staff", "Arcade", "Dining", "Bath", "Delivery", "Oven"];
const totalKeys = 5;

const pos = {
  Kitchen: [12, 16],
  Storage: [12, 50],
  Staff: [12, 84],
  Arcade: [45, 16],
  Dining: [45, 50],
  Bath: [45, 84],
  Delivery: [82, 16],
  Oven: [82, 50],
  Exit: [82, 84]
};

let player = "Dining";
let killer = "Storage";
let hearts = 3;
let keys = [];
let got = [];
let gameStarted = false;
let startTime = 0;
let audioContext = null;
let lastWarningTime = 0;

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const startScreen = document.getElementById("startScreen");
const hud = document.getElementById("hud");
const gameWrap = document.getElementById("gameWrap");
const messageBox = document.getElementById("messageBox");
const endScreen = document.getElementById("endScreen");

const playerToken = document.getElementById("playerToken");
const killerToken = document.getElementById("killerToken");

const keyCount = document.getElementById("keyCount");
const heartsText = document.getElementById("hearts");
const playerRoom = document.getElementById("playerRoom");
const killerRoom = document.getElementById("killerRoom");
const exitState = document.getElementById("exitState");
const dangerText = document.getElementById("dangerText");
const dangerBar = document.getElementById("dangerBar");
const messageText = document.getElementById("messageText");
const goalText = document.getElementById("goalText");
const bestTimeText = document.getElementById("bestTime");
const flashOverlay = document.getElementById("flashOverlay");

const endEyebrow = document.getElementById("endEyebrow");
const endTitle = document.getElementById("endTitle");
const endText = document.getElementById("endText");
const endTime = document.getElementById("endTime");
const endHearts = document.getElementById("endHearts");
const endKeys = document.getElementById("endKeys");
const endBestTime = document.getElementById("endBestTime");

document.querySelectorAll(".room").forEach((btn) => {
  btn.addEventListener("click", () => move(btn.dataset.room));
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", resetGame);

function initAudio() {
  if (!audioContext) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) audioContext = new AudioCtx();
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

function flash(type = "warning") {
  if (!flashOverlay) return;

  flashOverlay.classList.remove("flash");

  if (type === "hit") {
    flashOverlay.style.background = "rgba(255,0,0,.34)";
  } else {
    flashOverlay.style.background = "rgba(255,0,0,.20)";
  }

  void flashOverlay.offsetWidth;
  flashOverlay.classList.add("flash");
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function assignKeys() {
  keys = shuffle(allRooms).slice(0, totalKeys);
  got = [];
}

function startGame() {
  initAudio();
  assignKeys();
  player = "Dining";
  killer = "Storage";
  hearts = 3;
  gameStarted = true;
  startTime = Date.now();
  lastWarningTime = 0;

  startScreen.classList.add("hidden");
  hud.classList.remove("hidden");
  gameWrap.classList.remove("hidden");
  messageBox.classList.remove("hidden");
  endScreen.classList.add("hidden");

  msg("Goal: Collect all 5 keys, then reach the Exit.");
  update();
}

function resetGame() {
  player = "Dining";
  killer = "Storage";
  hearts = 3;
  keys = [];
  got = [];
  gameStarted = false;
  startTime = 0;
  lastWarningTime = 0;

  startScreen.classList.remove("hidden");
  hud.classList.add("hidden");
  gameWrap.classList.add("hidden");
  messageBox.classList.add("hidden");
  endScreen.classList.add("hidden");

  msg("Press Start to begin.");
  update();
}

function move(room) {
  if (!gameStarted) return;
  if (!rooms[player].includes(room)) return;

  player = room;
  playMoveSound();

  if (keys.includes(player) && !got.includes(player)) {
    got.push(player);
    playKeySound();

    if (got.length === totalKeys) {
      msg("All 5 keys collected! The Exit is OPEN!");
    } else {
      const left = totalKeys - got.length;
      msg(`You found a key in ${player}. ${left} key${left === 1 ? "" : "s"} left.`);
    }
  } else if (player === "Exit" && got.length < totalKeys) {
    msg("The Exit is locked. Collect all 5 keys first.");
    playTone(150, 0.12, "square", 0.04);
  } else {
    msg(`You moved to ${player}.`);
  }

  if (player === killer) {
    hit();
    if (!gameStarted) return;
  }

  moveKiller();

  if (player === killer) {
    hit();
    if (!gameStarted) return;
  }

  if (player === "Exit" && got.length === totalKeys) {
    win();
    return;
  }

  maybeWarn();
  update();
}

function moveKiller() {
  const nextStep = shortestPath(killer, player);

  if (nextStep.length > 1 && Math.random() < 0.9) {
    killer = nextStep[1];
  } else {
    const next = rooms[killer];
    killer = next[Math.floor(Math.random() * next.length)];
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

function dist(a, b) {
  return Math.max(0, shortestPath(a, b).length - 1);
}

function maybeWarn() {
  const d = dist(player, killer);
  const now = Date.now();

  if (d === 1 && now - lastWarningTime > 1200) {
    msg("Warning: The killer is very close!");
    playWarningSound();
    flash("warning");
    lastWarningTime = now;
  } else if (got.length === totalKeys && player !== "Exit") {
    msg("All keys collected! Run to the Exit!");
  }
}

function hit() {
  hearts--;
  playHitSound();
  flash("hit");

  if (hearts <= 0) {
    lose();
    return;
  }

  player = "Dining";
  msg(`Caught! You lost 1 heart. ${hearts} heart${hearts === 1 ? "" : "s"} left. Back to Dining Area.`);
  update();
}

function win() {
  gameStarted = false;
  hud.classList.add("hidden");
  gameWrap.classList.add("hidden");
  messageBox.classList.add("hidden");
  endScreen.classList.remove("hidden");

  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const bestKey = "rabbitEscapePizzariaBestTime";
  const best = localStorage.getItem(bestKey);

  if (!best || seconds < Number(best)) {
    localStorage.setItem(bestKey, String(seconds));
  }

  playWinSound();

  endEyebrow.textContent = "ROUND COMPLETE";
  endTitle.textContent = "You Escaped!";
  endText.textContent = "You got all 5 keys and escaped the pizzaria.";
  endTime.textContent = `${seconds}s`;
  endHearts.textContent = `${hearts}`;
  endKeys.textContent = `${got.length}/${totalKeys}`;
  endBestTime.textContent = `${localStorage.getItem(bestKey)}s`;

  updateBest();
}

function lose() {
  gameStarted = false;
  hud.classList.add("hidden");
  gameWrap.classList.add("hidden");
  messageBox.classList.add("hidden");
  endScreen.classList.remove("hidden");

  endEyebrow.textContent = "GAME OVER";
  endTitle.textContent = "You Were Caught!";
  endText.textContent = "The killer rabbit got you in the pizzaria.";
  endTime.textContent = "--";
  endHearts.textContent = "0";
  endKeys.textContent = `${got.length}/${totalKeys}`;
  endBestTime.textContent = localStorage.getItem("rabbitEscapePizzariaBestTime")
    ? `${localStorage.getItem("rabbitEscapePizzariaBestTime")}s`
    : "--";
}

function place(el, room) {
  el.style.top = pos[room][0] + "%";
  el.style.left = pos[room][1] + "%";
}

function updateGoal() {
  if (!goalText) return;

  if (!gameStarted) {
    goalText.textContent = "Find 5 keys";
    return;
  }

  if (got.length === totalKeys) {
    goalText.textContent = "Reach the Exit";
  } else {
    const left = totalKeys - got.length;
    goalText.textContent = `Find ${left} more key${left === 1 ? "" : "s"}`;
  }
}

function updateBest() {
  const best = localStorage.getItem("rabbitEscapePizzariaBestTime");
  if (bestTimeText) {
    bestTimeText.textContent = best ? `${best}s` : "--";
  }
}

function update() {
  place(playerToken, player);
  place(killerToken, killer);

  keyCount.textContent = got.length;
  heartsText.textContent = "❤️ ".repeat(hearts).trim();
  playerRoom.textContent = player;
  killerRoom.textContent = killer;
  exitState.textContent = got.length === totalKeys ? "OPEN" : "Locked";

  const d = dist(player, killer);
  dangerText.textContent = d <= 1 ? "High" : d === 2 ? "Medium" : "Low";
  dangerBar.style.width = d <= 1 ? "90%" : d === 2 ? "55%" : "20%";

  updateGoal();
  updateBest();

  document.querySelectorAll(".room").forEach((btn) => {
    const room = btn.dataset.room;

    btn.classList.remove(
      "connected",
      "locked",
      "current",
      "killer-room",
      "key-room",
      "exit-open",
      "room-cleared"
    );

    if (room === player) {
      btn.classList.add("current");
      btn.disabled = true;
    } else if (rooms[player].includes(room)) {
      btn.classList.add("connected");
      btn.disabled = false;
    } else {
      btn.classList.add("locked");
      btn.disabled = true;
    }

    if (room === killer) {
      btn.classList.add("killer-room");
    }

    if (keys.includes(room) && !got.includes(room)) {
      btn.classList.add("key-room");
    }

    if (got.includes(room)) {
      btn.classList.add("room-cleared");
    }

    if (room === "Exit" && got.length === totalKeys) {
      btn.classList.add("exit-open");
    }
  });
}

function msg(t) {
  messageText.textContent = t;
}

update();

const rooms = {
  Electrical: ["Gym", "Playground"],
  Gym: ["Electrical", "Kitchen", "Playground"],
  Kitchen: ["Gym", "Security"],
  Security: ["Kitchen", "Playground", "Exit"],
  Playground: ["Electrical", "Gym", "Security"],
  Exit: ["Security"]
};

const keyRooms = ["Electrical", "Gym", "Kitchen", "Security"];

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
let collectedKeys = [];
let hearts = 3;
let maxHearts = 3;
let gameStarted = false;
let startTime = 0;
let isBusy = false;
let killerMoveTimer = null;

const startScreen = document.getElementById("startScreen");
const hud = document.getElementById("hud");
const gameWrap = document.getElementById("gameWrap");
const messageBox = document.getElementById("messageBox");
const endScreen = document.getElementById("endScreen");
const endEyebrow = document.getElementById("endEyebrow");
const endTitle = document.getElementById("endTitle");
const endText = document.getElementById("endText");
const endTime = document.getElementById("endTime");
const endHearts = document.getElementById("endHearts");
const endKeys = document.getElementById("endKeys");
const endBestTime = document.getElementById("endBestTime");
const nextLevelBtn = document.getElementById("nextLevelBtn");

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

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const roomButtons = document.querySelectorAll(".room-marker");

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", resetGame);
nextLevelBtn.addEventListener("click", () => {
  localStorage.setItem("rabbitEscapeLevel2Unlocked", "true");
  window.location.href = "../pizzeria/";
});

roomButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!gameStarted || isBusy) return;
    movePlayer(button.dataset.room);
  });
});

function startGame() {
  clearPendingTimer();
  nextLevelBtn.classList.add("hidden");
  gameStarted = true;
  isBusy = false;
  startTime = Date.now();

  startScreen.classList.add("hidden");
  hud.classList.remove("hidden");
  gameWrap.classList.remove("hidden");
  messageBox.classList.remove("hidden");
  endScreen.classList.add("hidden");

  showMessage("Goal: Collect all 4 keys, then reach the Exit.");
  updateUI();
}

function resetGame() {
  clearPendingTimer();

  playerRoom = "Playground";
  killerRoom = "Security";
  collectedKeys = [];
  hearts = maxHearts;
  gameStarted = false;
  startTime = 0;
  isBusy = false;
  nextLevelBtn.classList.add("hidden");

  startScreen.classList.remove("hidden");
  hud.classList.add("hidden");
  gameWrap.classList.add("hidden");
  messageBox.classList.add("hidden");
  endScreen.classList.add("hidden");

  showMessage("Click Start to begin.");
  updateUI();
}

function clearPendingTimer() {
  if (killerMoveTimer) {
    clearTimeout(killerMoveTimer);
    killerMoveTimer = null;
  }
  addKillerTurnEffect(false);
}

function movePlayer(targetRoom) {
  if (!rooms[playerRoom].includes(targetRoom)) {
    showMessage("You can only move to connected rooms.");
    return;
  }

  isBusy = true;
  flashSelectedRoom(targetRoom);

  playerRoom = targetRoom;
  handleRoomArrival();
  updateUI();

  if (!gameStarted) {
    finishTurn();
    return;
  }

  if (playerRoom === killerRoom) {
    playerHit();
    updateUI();

    if (!gameStarted) {
      finishTurn();
      return;
    }
  }

  if (playerRoom === "Exit" && exitIsOpen()) {
    winGame();
    finishTurn();
    return;
  }

  showMessage("The killer is moving...");
  addKillerTurnEffect(true);

  killerMoveTimer = setTimeout(() => {
    killerMoveTimer = null;

    if (!gameStarted) {
      finishTurn();
      return;
    }

    moveKiller();
    addKillerTurnEffect(false);
    updateUI();

    if (playerRoom === killerRoom) {
      playerHit();
      updateUI();

      if (!gameStarted) {
        finishTurn();
        return;
      }
    }

    if (playerRoom === "Exit" && exitIsOpen()) {
      winGame();
      finishTurn();
      return;
    }

    const distance = getDistance(playerRoom, killerRoom);

    if (distance === 1) {
      showMessage("Warning: The killer is very close!");
    } else if (exitIsOpen() && playerRoom !== "Exit") {
      showMessage("All keys collected! The Exit is OPEN!");
    } else {
      showMessage(`You are in ${playerRoom}.`);
    }

    updateUI();
    finishTurn();
  }, 320);
}

function finishTurn() {
  isBusy = false;
  addKillerTurnEffect(false);
  updateUI();
}

function handleRoomArrival() {
  if (keyRooms.includes(playerRoom) && !collectedKeys.includes(playerRoom)) {
    collectedKeys.push(playerRoom);

    if (collectedKeys.length === keyRooms.length) {
      showMessage("All 4 keys collected! The Exit is OPEN!");
    } else {
      const keysLeft = keyRooms.length - collectedKeys.length;
      showMessage(`You found a key in ${playerRoom}. ${keysLeft} key left.`);
    }
    return;
  }

  if (playerRoom === "Exit" && !exitIsOpen()) {
    showMessage("The Exit is locked. Collect all 4 keys first.");
    return;
  }

  if (playerRoom === "Exit" && exitIsOpen()) {
    showMessage("Escape now!");
    return;
  }

  const distance = getDistance(playerRoom, killerRoom);

  if (distance === 1) {
    showMessage("Warning: The killer is very close!");
  } else {
    showMessage(`You moved to ${playerRoom}.`);
  }
}

function moveKiller() {
  const path = shortestPath(killerRoom, playerRoom);

  if (path.length > 1 && Math.random() < 0.85) {
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

  if (hearts <= 0) {
    loseGame();
    return;
  }

  playerRoom = "Playground";
  showMessage(`Caught! You lost 1 heart. ${hearts} left. Back to Playground.`);
}

function loseGame() {
  clearPendingTimer();
  gameStarted = false;
  isBusy = false;
  nextLevelBtn.classList.add("hidden");

  hud.classList.add("hidden");
  gameWrap.classList.add("hidden");
  messageBox.classList.add("hidden");
  endScreen.classList.remove("hidden");

  endEyebrow.textContent = "GAME OVER";
  endTitle.textContent = "Caught by the Killer Rabbit";
  endText.textContent = "You were caught 3 times. Try again, collect all 4 keys, and escape.";
  endTime.textContent = startTime ? `${Math.floor((Date.now() - startTime) / 1000)}s` : "--";
  endHearts.textContent = "0";
  endKeys.textContent = `${collectedKeys.length}/4`;
  endBestTime.textContent = localStorage.getItem("rabbitEscapeBestTime")
    ? `${localStorage.getItem("rabbitEscapeBestTime")}s`
    : "--";
}

function winGame() {
  clearPendingTimer();
  gameStarted = false;
  isBusy = false;
  nextLevelBtn.classList.remove("hidden");
  localStorage.setItem("rabbitEscapeLevel2Unlocked", "true");

  hud.classList.add("hidden");
  gameWrap.classList.add("hidden");
  messageBox.classList.add("hidden");
  endScreen.classList.remove("hidden");

  const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
  const currentBest = localStorage.getItem("rabbitEscapeBestTime");

  if (!currentBest || totalSeconds < Number(currentBest)) {
    localStorage.setItem("rabbitEscapeBestTime", String(totalSeconds));
  }

  const best = localStorage.getItem("rabbitEscapeBestTime");

  endEyebrow.textContent = "LEVEL 1 COMPLETE";
  endTitle.textContent = "School Escape Complete!";
  endText.textContent = "You escaped the school. Venezia Pizzeria is now unlocked.";
  endTime.textContent = `${totalSeconds}s`;
  endHearts.textContent = `${hearts}`;
  endKeys.textContent = `${collectedKeys.length}/4`;
  endBestTime.textContent = best ? `${best}s` : "--";

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
    width = 85;
  } else if (d === 2) {
    label = "Medium";
    width = 55;
  }

  dangerText.textContent = label;
  dangerBar.style.width = `${width}%`;
  dangerBar.classList.toggle("danger-high", d <= 1);
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

function flashSelectedRoom(roomName) {
  const button = document.querySelector(`.room-marker[data-room="${roomName}"]`);
  if (!button) return;

  button.classList.add("selected-room");
  setTimeout(() => {
    button.classList.remove("selected-room");
  }, 260);
}

function addKillerTurnEffect(isActive) {
  const board = document.querySelector(".map-board");
  if (!board) return;
  board.classList.toggle("killer-turn", isActive);
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
      "room-cleared"
    );

    if (room === playerRoom) {
      button.classList.add("current");
      button.disabled = true;
    } else if (!isBusy && rooms[playerRoom].includes(room)) {
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

    if (room === "Exit" && exitIsOpen()) {
      button.classList.add("exit-open");
    }
  });

  setTokenPosition(playerToken, playerRoom);
  setTokenPosition(killerToken, killerRoom);
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

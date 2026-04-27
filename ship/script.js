document.addEventListener("DOMContentLoaded", () => {
  const rooms = {
    "Captain Bridge": ["Hallway"],
    Restaurant: ["Hallway"],
    "Crew Quarters": ["Hallway"],
    Hallway: ["Captain Bridge", "Restaurant", "Crew Quarters", "Grand Staircase"],
    "Grand Staircase": ["Hallway", "Rooms Left", "Rooms Right", "Lounge"],
    "Rooms Left": ["Grand Staircase", "Lounge"],
    "Rooms Right": ["Grand Staircase", "Lounge"],
    Lounge: ["Rooms Left", "Rooms Right", "Grand Staircase", "Balcony Deck"],
    "Balcony Deck": ["Lounge", "Left Lifeboat", "Right Lifeboat"],
    "Left Lifeboat": ["Balcony Deck"],
    "Right Lifeboat": ["Balcony Deck"]
  };

  const roomPositions = {
    "Captain Bridge": { top: 13, left: 50 },
    Restaurant: { top: 34, left: 29 },
    Hallway: { top: 36, left: 50 },
    "Crew Quarters": { top: 34, left: 70 },
    "Rooms Left": { top: 56, left: 28 },
    "Grand Staircase": { top: 55, left: 50 },
    "Rooms Right": { top: 56, left: 70 },
    Lounge: { top: 75, left: 50 },
    "Balcony Deck": { top: 91, left: 50 },
    "Left Lifeboat": { top: 89, left: 8 },
    "Right Lifeboat": { top: 89, left: 92 }
  };

  const possibleRopeRooms = [
    "Captain Bridge",
    "Restaurant",
    "Crew Quarters",
    "Rooms Left",
    "Rooms Right",
    "Grand Staircase",
    "Lounge"
  ];

  const totalRopes = 5;
  const maxHearts = 3;

  let escapeTimer = null;
  let captainTimer = null;
  let escapeTimeLeft = 10;

  let gameState = {
    playerRoom: "Lounge",
    captainRoom: "Captain Bridge",
    ropeRooms: [],
    collectedRopes: [],
    hearts: maxHearts,
    gameStarted: false,
    escapeStarted: false,
    correctBoat: "Left Lifeboat"
  };

  const ui = {
    ambientMusic: document.getElementById("ambientMusic"),
    hud: document.getElementById("hud"),
    gameWrap: document.getElementById("gameWrap"),
    endScreen: document.getElementById("endScreen"),
    restartBtn: document.getElementById("restartBtn"),
    menuBtn: document.getElementById("menuBtn"),
    ropeCount: document.getElementById("ropeCount"),
    hearts: document.getElementById("hearts"),
    playerRoom: document.getElementById("playerRoom"),
    captainState: document.getElementById("captainState"),
    escapeState: document.getElementById("escapeState"),
    messageText: document.getElementById("messageText"),
    timerText: document.getElementById("timerText"),
    endTitle: document.getElementById("endTitle"),
    endText: document.getElementById("endText"),
    playerToken: document.getElementById("playerToken"),
    killerToken: document.getElementById("killerToken"),
    ropeLayer: document.getElementById("ropeLayer"),
    flashOverlay: document.getElementById("flashOverlay"),
    roomButtons: document.querySelectorAll(".room-hotspot")
  };

  ui.restartBtn.addEventListener("click", startGame);

  ui.menuBtn.addEventListener("click", () => {
    stopMusic();
    clearInterval(captainTimer);
    clearInterval(escapeTimer);
    window.location.href = "../";
  });

  ui.roomButtons.forEach((button) => {
    button.addEventListener("click", () => {
      startMusic();
      movePlayer(button.dataset.room);
    });
  });

  document.addEventListener("click", startMusic);
  document.addEventListener("touchstart", startMusic);

  function isMuted() {
    return localStorage.getItem("stillInsaneMuted") === "true";
  }

  function startMusic() {
    if (isMuted() || !ui.ambientMusic) return;

    ui.ambientMusic.volume = gameState.escapeStarted ? 0.48 : 0.35;
    ui.ambientMusic.muted = false;
    ui.ambientMusic.play().catch(() => {});
  }

  function stopMusic() {
    if (!ui.ambientMusic) return;
    ui.ambientMusic.pause();
    ui.ambientMusic.currentTime = 0;
  }

  function loadSelectedCharacter() {
    const character = localStorage.getItem("stillInsaneCharacter") || "player.png";

    if (ui.playerToken) {
      ui.playerToken.src = `../assets/${character}`;
    }
  }

  function startGame() {
    clearInterval(captainTimer);
    clearInterval(escapeTimer);

    gameState = {
      playerRoom: "Lounge",
      captainRoom: "Captain Bridge",
      ropeRooms: shuffle([...possibleRopeRooms]).slice(0, totalRopes),
      collectedRopes: [],
      hearts: maxHearts,
      gameStarted: true,
      escapeStarted: false,
      correctBoat: Math.random() < 0.5 ? "Left Lifeboat" : "Right Lifeboat"
    };

    loadSelectedCharacter();

    ui.endScreen.classList.add("hidden");
    ui.hud.classList.remove("hidden");
    ui.gameWrap.classList.remove("hidden");
    ui.timerText.classList.add("hidden");

    showMessage("Collect 5 ropes to fix the lifeboat.");
    updateUI();
    startMusic();
    startCaptainTimer();
  }

  function startCaptainTimer() {
    clearInterval(captainTimer);

    captainTimer = setInterval(() => {
      if (!gameState.gameStarted) return;

      moveCaptainRandomly();
      updateCaptainVisibility();

      if (gameState.playerRoom === gameState.captainRoom) {
        captainCatch();
      }
    }, gameState.escapeStarted ? 2200 : 3500);
  }

  function movePlayer(room) {
    if (!gameState.gameStarted) return;

    const connectedRooms = rooms[gameState.playerRoom];

    if (!connectedRooms.includes(room)) {
      showMessage(`You cannot move from ${gameState.playerRoom} to ${room}.`);
      return;
    }

    if ((room === "Left Lifeboat" || room === "Right Lifeboat") && !gameState.escapeStarted) {
      showMessage("The lifeboats need ropes first.");
      return;
    }

    gameState.playerRoom = room;

    collectRopeIfNeeded();

    if (gameState.escapeStarted && (room === "Left Lifeboat" || room === "Right Lifeboat")) {
      checkBoatEscape(room);
      return;
    }

    if (gameState.playerRoom === gameState.captainRoom) {
      captainCatch();
      return;
    }

    updateUI();
  }

  function collectRopeIfNeeded() {
    const room = gameState.playerRoom;

    if (gameState.ropeRooms.includes(room) && !gameState.collectedRopes.includes(room)) {
      gameState.collectedRopes.push(room);

      if (gameState.collectedRopes.length >= totalRopes) {
        startEscapeCountdown();
      } else {
        showMessage(`Rope found! ${totalRopes - gameState.collectedRopes.length} left.`);
      }
    }
  }

  function startEscapeCountdown() {
    gameState.escapeStarted = true;
    escapeTimeLeft = 10;

    clearInterval(captainTimer);
    startCaptainTimer();

    ui.timerText.classList.remove("hidden");
    ui.timerText.textContent = escapeTimeLeft;

    if (ui.ambientMusic) ui.ambientMusic.volume = 0.48;

    showMessage("Hull breach! Escape to a lifeboat now!");

    escapeTimer = setInterval(() => {
      escapeTimeLeft--;
      ui.timerText.textContent = escapeTimeLeft;

      if (escapeTimeLeft <= 0) {
        sinkGame();
      }
    }, 1000);
  }

  function checkBoatEscape(room) {
    if (room === gameState.correctBoat) {
      winGame();
    } else {
      gameState.hearts--;
      flash();
      gameState.playerRoom = "Balcony Deck";

      if (gameState.hearts <= 0) {
        loseGame("Wrong lifeboat. The ship swallowed you.");
      } else {
        showMessage("Wrong lifeboat! Try the other one!");
        updateUI();
      }
    }
  }

  function moveCaptainRandomly() {
    const captainRooms = [
      "Captain Bridge",
      "Restaurant",
      "Hallway",
      "Crew Quarters",
      "Rooms Left",
      "Grand Staircase",
      "Rooms Right",
      "Lounge",
      "Balcony Deck"
    ];

    gameState.captainRoom = captainRooms[Math.floor(Math.random() * captainRooms.length)];
  }

  function updateCaptainVisibility() {
    if (!ui.killerToken) return;

    const connectedRooms = rooms[gameState.playerRoom] || [];
    const visible =
      gameState.playerRoom === gameState.captainRoom ||
      connectedRooms.includes(gameState.captainRoom);

    if (visible) {
      ui.killerToken.classList.remove("hidden-captain");
      ui.killerToken.classList.add("visible-captain");
      moveToken(ui.killerToken, gameState.captainRoom);
      ui.captainState.textContent = "Nearby";
    } else {
      ui.killerToken.classList.remove("visible-captain");
      ui.killerToken.classList.add("hidden-captain");
      ui.captainState.textContent = "Hidden";
    }
  }

  function captainCatch() {
    flash();
    gameState.hearts--;

    if (gameState.escapeStarted) {
      escapeTimeLeft = Math.max(1, escapeTimeLeft - 2);
      ui.timerText.textContent = escapeTimeLeft;
    }

    if (gameState.hearts <= 0) {
      loseGame("The ghost captain caught you.");
      return;
    }

    gameState.playerRoom = "Lounge";
    moveCaptainRandomly();
    showMessage("The Captain found you! You were sent back to the Lounge.");
    updateUI();
  }

  function sinkGame() {
    loseGame("The ship sank before you reached the lifeboat.");
  }

  function winGame() {
    gameState.gameStarted = false;
    clearInterval(captainTimer);
    clearInterval(escapeTimer);
    stopMusic();

    ui.endTitle.textContent = "VOYAGE COMPLETE!";
    ui.endText.textContent = "You fixed the lifeboat and escaped the haunted ship.";
    ui.hud.classList.add("hidden");
    ui.gameWrap.classList.add("hidden");
    ui.endScreen.classList.remove("hidden");
  }

  function loseGame(text) {
    gameState.gameStarted = false;
    clearInterval(captainTimer);
    clearInterval(escapeTimer);
    stopMusic();

    ui.endTitle.textContent = "Try Again!";
    ui.endText.textContent = text;
    ui.hud.classList.add("hidden");
    ui.gameWrap.classList.add("hidden");

    setTimeout(() => {
      ui.endScreen.classList.remove("hidden");
    }, 500);
  }

  function updateUI() {
    ui.ropeCount.textContent = gameState.collectedRopes.length;
    ui.hearts.textContent = "❤️".repeat(gameState.hearts);
    ui.playerRoom.textContent = gameState.playerRoom;
    ui.escapeState.textContent = gameState.escapeStarted ? "Escape Now" : "Need Ropes";

    moveToken(ui.playerToken, gameState.playerRoom);
    updateCaptainVisibility();
    drawRopes();
  }

  function drawRopes() {
    ui.ropeLayer.innerHTML = "";

    gameState.ropeRooms.forEach((room) => {
      if (gameState.collectedRopes.includes(room)) return;

      const pos = roomPositions[room];
      const rope = document.createElement("div");
      rope.className = "rope";
      rope.style.top = `${pos.top + 3}%`;
      rope.style.left = `${pos.left + 4}%`;
      ui.ropeLayer.appendChild(rope);
    });
  }

  function moveToken(token, room) {
    if (!token || !roomPositions[room]) return;

    const pos = roomPositions[room];
    token.style.top = `${pos.top}%`;
    token.style.left = `${pos.left}%`;

    token.classList.remove("moving");
    void token.offsetWidth;
    token.classList.add("moving");
  }

  function flash() {
    ui.flashOverlay.classList.remove("active");
    void ui.flashOverlay.offsetWidth;
    ui.flashOverlay.classList.add("active");
  }

  function showMessage(text) {
    ui.messageText.textContent = text;
  }

  function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  startGame();
});
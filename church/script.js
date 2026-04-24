document.addEventListener("DOMContentLoaded", () => {
  const rooms = {
    "Bell Tower": ["Main Hall"],
    Storage: ["Main Hall"],
    "Main Hall": ["Bell Tower", "Storage", "Confession", "Altar"],
    Confession: ["Main Hall"],
    Altar: ["Main Hall", "Entrance", "Basement", "Graveyard"],
    Entrance: ["Altar"],
    Basement: ["Altar", "Exit"],
    Graveyard: ["Altar", "Exit"],
    Exit: ["Basement", "Graveyard"]
  };

  const roomPositions = {
    "Bell Tower": { top: 18, left: 50 },
    Storage: { top: 39, left: 25 },
    "Main Hall": { top: 43, left: 50 },
    Confession: { top: 39, left: 75 },
    Altar: { top: 62, left: 50 },
    Entrance: { top: 76, left: 25 },
    Basement: { top: 79, left: 50 },
    Graveyard: { top: 75, left: 76 },
    Exit: { top: 91, left: 50 }
  };

  const secretWord = "INSANE";

  const relicRooms = [
    "Bell Tower",
    "Storage",
    "Main Hall",
    "Confession",
    "Altar",
    "Graveyard"
  ];

  const relicLetters = {
    "Bell Tower": "I",
    Storage: "N",
    "Main Hall": "S",
    Confession: "A",
    Altar: "N",
    Graveyard: "E"
  };

  const totalRelics = 6;

  let exitTimer = null;
  let exitTimeLeft = 5;
  let audioContext = null;
  let playerLight = null;

  let gameState = {
    playerRoom: "Entrance",
    killerRoom: "Bell Tower",
    collectedRelics: [],
    hearts: 1,
    gameStarted: false,
    exitChallengeStarted: false
  };

  const ui = {
    ambientMusic: document.getElementById("ambientMusic"),
    jumpscareSound: document.getElementById("jumpscareSound"),
    hud: document.getElementById("hud"),
    gameWrap: document.getElementById("gameWrap"),
    endScreen: document.getElementById("endScreen"),
    restartBtn: document.getElementById("restartBtn"),
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
    flashOverlay: document.getElementById("flashOverlay"),
    jumpscareOverlay: document.getElementById("jumpscareOverlay"),
    mapBoard: document.querySelector(".map-board"),
    roomButtons: document.querySelectorAll(".room-hotspot"),
    lettersText: document.getElementById("lettersText"),
    codeOverlay: document.getElementById("codeOverlay"),
    timerText: document.getElementById("timerText"),
    codeInput: document.getElementById("codeInput"),
    submitCodeBtn: document.getElementById("submitCodeBtn"),
    codeHint: document.getElementById("codeHint")
  };

  if (ui.restartBtn) ui.restartBtn.addEventListener("click", startGame);

  if (ui.menuBtn) {
    ui.menuBtn.addEventListener("click", () => {
      window.location.href = "../";
    });
  }

  if (ui.submitCodeBtn) {
    ui.submitCodeBtn.addEventListener("click", submitExitCode);
  }

  if (ui.codeInput) {
    ui.codeInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") submitExitCode();
    });
  }

  ui.roomButtons.forEach((button) => {
    button.addEventListener("click", () => {
      startAmbientMusic();
      movePlayer(button.dataset.room);
    });
  });

  document.addEventListener("click", startAmbientMusic);
  document.addEventListener("touchstart", startAmbientMusic);

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

  function createPlayerLight() {
    if (playerLight || !ui.mapBoard) return;

    playerLight = document.createElement("div");
    playerLight.className = "player-light";
    ui.mapBoard.appendChild(playerLight);
  }

  function startGame() {
    clearInterval(exitTimer);
    exitTimer = null;

    initAudio();
    startAmbientMusic();
    createPlayerLight();

    gameState = {
      playerRoom: "Entrance",
      killerRoom: "Bell Tower",
      collectedRelics: [],
      hearts: 1,
      gameStarted: true,
      exitChallengeStarted: false
    };

    if (ui.codeOverlay) ui.codeOverlay.classList.add("hidden");
    if (ui.endScreen) ui.endScreen.classList.add("hidden");
    if (ui.hud) ui.hud.classList.remove("hidden");
    if (ui.gameWrap) ui.gameWrap.classList.remove("hidden");

    showMessage("Collect the 6 cursed letters. Then survive the Exit test.");
    updateUI();
  }

  function movePlayer(room) {
    if (!gameState.gameStarted || gameState.exitChallengeStarted) return;

    if (!rooms[room]) {
      showMessage("Room error.");
      return;
    }

    const connectedRooms = rooms[gameState.playerRoom];

    if (!connectedRooms.includes(room)) {
      showMessage(`You cannot move from ${gameState.playerRoom} to ${room}.`);
      playTone(130, 0.15, "square", 0.03);
      return;
    }

    if (room === "Exit" && gameState.collectedRelics.length < totalRelics) {
      showMessage("The Exit is sealed. Find every cursed letter first.");
      playTone(130, 0.15, "square", 0.03);
      return;
    }

    gameState.playerRoom = room;
    playTone(430, 0.08, "triangle", 0.035);

    collectRelicIfNeeded();

    if (room === "Exit" && gameState.collectedRelics.length >= totalRelics) {
      updateUI();
      startExitChallenge();
      return;
    }

    moveKillerSmart();
    checkDanger();
    updateUI();
    dangerWarning();
  }

  function collectRelicIfNeeded() {
    const room = gameState.playerRoom;

    if (relicRooms.includes(room) && !gameState.collectedRelics.includes(room)) {
      gameState.collectedRelics.push(room);

      const letter = relicLetters[room];
      showMessage(`The relic whispers: "${letter}"`);

      playTone(740, 0.1, "triangle", 0.05);
      setTimeout(() => playTone(940, 0.12, "triangle", 0.05), 90);
    }
  }

  function moveKillerSmart() {
    const chaseChance = gameState.collectedRelics.length >= 3 ? 0.7 : 0.45;
    const path = findShortestPath(gameState.killerRoom, gameState.playerRoom);

    if (path.length > 1 && Math.random() < chaseChance) {
      gameState.killerRoom = path[1];
    } else {
      const options = rooms[gameState.killerRoom].filter((room) => room !== "Exit");
      if (options.length > 0) {
        gameState.killerRoom = options[Math.floor(Math.random() * options.length)];
      }
    }
  }

  function findShortestPath(start, target) {
    const queue = [[start]];
    const visited = new Set([start]);

    while (queue.length > 0) {
      const path = queue.shift();
      const room = path[path.length - 1];

      if (room === target) return path;

      rooms[room].forEach((nextRoom) => {
        if (!visited.has(nextRoom)) {
          visited.add(nextRoom);
          queue.push([...path, nextRoom]);
        }
      });
    }

    return [start];
  }

  function dangerWarning() {
    const connectedRooms = rooms[gameState.playerRoom];

    if (connectedRooms.includes(gameState.killerRoom)) {
      showMessage("You hear breathing nearby...");
      playTone(90, 0.18, "sawtooth", 0.035);
    }
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

  function startExitChallenge() {
    gameState.exitChallengeStarted = true;
    exitTimeLeft = 5;

    ui.codeOverlay.classList.remove("hidden");
    ui.codeInput.value = "";
    ui.codeHint.textContent = `Letters found: ${getRevealedWordDisplay()}`;
    ui.timerText.textContent = exitTimeLeft;

    setTimeout(() => ui.codeInput.focus(), 150);

    exitTimer = setInterval(() => {
      exitTimeLeft--;
      ui.timerText.textContent = exitTimeLeft;

      if (exitTimeLeft <= 0) {
        clearInterval(exitTimer);
        failExitChallenge("Too slow. The church seals your fate.");
      }
    }, 1000);
  }

  function submitExitCode() {
    if (!gameState.exitChallengeStarted) return;

    const answer = ui.codeInput.value.trim().toUpperCase();

    if (answer === secretWord) {
      clearInterval(exitTimer);
      winGame();
    } else {
      failExitChallenge("Wrong word. The killer heard you.");
    }
  }

  function failExitChallenge(text) {
    clearInterval(exitTimer);
    ui.codeHint.textContent = text;

    setTimeout(() => {
      ui.codeOverlay.classList.add("hidden");
      gameState.playerRoom = "Exit";
      gameState.killerRoom = "Exit";
      checkDanger();
    }, 600);
  }

  function winGame() {
    gameState.gameStarted = false;
    stopAmbientMusic();

    ui.codeOverlay.classList.add("hidden");
    ui.endTitle.textContent = "FINAL BOSS COMPLETE!";
    ui.endText.textContent = "You solved the church word and escaped Still Insane.";
    ui.hud.classList.add("hidden");
    ui.gameWrap.classList.add("hidden");
    ui.endScreen.classList.remove("hidden");
  }

  function loseGame() {
    gameState.gameStarted = false;
    stopAmbientMusic();

    ui.endTitle.textContent = "Caught!";
    ui.endText.textContent = "The killer found you in the church.";
    ui.hud.classList.add("hidden");
    ui.gameWrap.classList.add("hidden");

    setTimeout(() => {
      ui.endScreen.classList.remove("hidden");
    }, 900);
  }

  function updateUI() {
    ui.keyCount.textContent = gameState.collectedRelics.length;
    ui.hearts.textContent = gameState.hearts > 0 ? "❤️" : "💔";
    ui.playerRoom.textContent = gameState.playerRoom;
    ui.killerRoom.textContent = gameState.killerRoom;
    ui.exitState.textContent =
      gameState.collectedRelics.length >= totalRelics ? "Code Required" : "Sealed";
    ui.lettersText.textContent = getRevealedWordDisplay();

    moveToken(ui.playerToken, gameState.playerRoom);
    moveToken(ui.killerToken, gameState.killerRoom);
    moveLight(gameState.playerRoom);
  }

  function getRevealedWordDisplay() {
    return relicRooms
      .map((room) => gameState.collectedRelics.includes(room) ? relicLetters[room] : "_")
      .join(" ");
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

  function moveLight(room) {
    if (!playerLight || !roomPositions[room]) return;

    const pos = roomPositions[room];

    playerLight.style.top = `${pos.top}%`;
    playerLight.style.left = `${pos.left}%`;
  }

  function showMessage(text) {
    if (ui.messageText) ui.messageText.textContent = text;
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
    }, 900);
  }

  startGame();
});
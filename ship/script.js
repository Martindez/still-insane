* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
}

body {
  min-height: 100vh;
  min-height: 100dvh;
  background: #05080b;
  color: white;
  font-family: Arial, Helvetica, sans-serif;
  overflow-x: hidden;
  user-select: none;
}

.app {
  width: min(1200px, 100%);
  margin: 0 auto;
  padding: 10px;
}

.topbar {
  text-align: center;
  margin-bottom: 10px;
}

.topbar h1 {
  margin: 6px 0 2px;
  font-size: clamp(1.6rem, 5vw, 2.3rem);
}

.topbar p {
  margin: 0;
  color: #ccc;
}

.panel {
  background: #141414;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 10px;
}

.screen {
  text-align: center;
  padding: 26px 14px;
}

.hidden {
  display: none !important;
}

.hud-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  font-size: 0.95rem;
}

.message {
  margin: 10px 0 0;
  color: #f1d66b;
  text-align: center;
  font-weight: 700;
}

.escape-timer {
  margin: 8px 0 0;
  color: #ff3333;
  text-align: center;
  font-size: clamp(2rem, 8vw, 4rem);
  font-weight: 900;
  text-shadow: 0 0 18px red;
  animation: timerPulse 0.7s infinite alternate;
}

.main-btn {
  background: #d81f26;
  color: white;
  border: 0;
  border-radius: 14px;
  padding: 14px 24px;
  margin: 8px;
  font-size: 18px;
  font-weight: 900;
  cursor: pointer;
}

.main-btn:hover {
  transform: scale(1.03);
  background: #ff2b33;
}

/* FIXED SHIP BOARD */

.map-board {
  position: relative;
  width: 100%;
  max-width: 980px;
  margin: 0 auto;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 18px;
  background: #000;
  touch-action: manipulation;

  box-shadow:
    0 0 25px rgba(0, 0, 0, 0.9),
    0 0 35px rgba(0, 80, 120, 0.22);
}

.map-board::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;

  background:
    radial-gradient(circle at center, transparent 48%, rgba(0, 0, 0, 0.48)),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.25));
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: #000;
  pointer-events: none;
}

/* HOTSPOTS */

.room-hotspot {
  position: absolute;
  border: 0;
  background: transparent !important;
  outline: none !important;
  cursor: pointer;
  z-index: 20;
  touch-action: manipulation;
}

/* BETTER ROOM ALIGNMENT */

.captain-bridge {
  top: 2%;
  left: 38%;
  width: 24%;
  height: 15%;
}

.restaurant {
  top: 25%;
  left: 24%;
  width: 18%;
  height: 16%;
}

.hallway {
  top: 22%;
  left: 44%;
  width: 12%;
  height: 24%;
}

.crew-quarters {
  top: 25%;
  left: 58%;
  width: 18%;
  height: 16%;
}

.rooms-left {
  top: 46%;
  left: 22%;
  width: 18%;
  height: 17%;
}

.grand-staircase {
  top: 44%;
  left: 43%;
  width: 14%;
  height: 20%;
}

.rooms-right {
  top: 46%;
  left: 60%;
  width: 18%;
  height: 17%;
}

.lounge {
  top: 67%;
  left: 35%;
  width: 30%;
  height: 14%;
}

.balcony-deck {
  top: 84%;
  left: 37%;
  width: 26%;
  height: 12%;
}

.left-lifeboat {
  top: 72%;
  left: 8%;
  width: 12%;
  height: 20%;
}

.right-lifeboat {
  top: 72%;
  left: 80%;
  width: 12%;
  height: 20%;
}

/* ROPE */

.rope-layer {
  position: absolute;
  inset: 0;
  z-index: 6;
  pointer-events: none;
}

.rope {
  position: absolute;
  width: clamp(22px, 3vw, 34px);
  height: clamp(22px, 3vw, 34px);
  transform: translate(-50%, -50%);
}

.rope::before {
  content: "🪢";
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: clamp(20px, 3vw, 30px);

  filter:
    drop-shadow(0 0 8px rgba(255, 210, 100, 0.9))
    drop-shadow(0 8px 8px black);

  animation: ropeFloat 1.4s infinite alternate;
}

/* TOKENS */

.token {
  position: absolute;
  object-fit: contain;
  pointer-events: none;
}

.player-token {
  width: clamp(48px, 6vw, 76px);
  height: clamp(48px, 6vw, 76px);

  transform: translate(-50%, -78%);
  z-index: 8;

  filter:
    drop-shadow(0 0 10px rgba(255, 235, 150, 0.9))
    drop-shadow(0 10px 10px black);

  transition:
    top 0.45s ease,
    left 0.45s ease;
}

.killer-token {
  width: clamp(62px, 7vw, 96px);
  height: clamp(62px, 7vw, 96px);

  transform: translate(-50%, -82%);
  z-index: 9;

  opacity: 0;

  filter:
    drop-shadow(0 0 18px rgba(80, 180, 255, 0.85))
    drop-shadow(0 12px 12px black);

  transition:
    top 0.45s ease,
    left 0.45s ease,
    opacity 0.35s ease,
    filter 0.35s ease;
}

.visible-captain {
  opacity: 0.85;
  animation: captainPulse 1.1s infinite alternate;
}

.hidden-captain {
  opacity: 0;
}

.token.moving {
  animation: movePop 0.35s ease;
}

/* FLASH */

.flash-overlay {
  position: fixed;
  inset: 0;
  background: rgba(60, 160, 255, 0.3);
  pointer-events: none;
  opacity: 0;
  z-index: 30;
}

.flash-overlay.active {
  animation: flash 0.35s ease;
}

/* ANIMATIONS */

@keyframes ropeFloat {
  from {
    transform: translateY(0) scale(0.95);
  }

  to {
    transform: translateY(-5px) scale(1.08);
  }
}

@keyframes captainPulse {
  from {
    opacity: 0.35;

    filter:
      blur(4px)
      drop-shadow(0 0 8px rgba(80, 180, 255, 0.5));
  }

  to {
    opacity: 0.9;

    filter:
      blur(0)
      drop-shadow(0 0 22px rgba(80, 180, 255, 0.95));
  }
}

@keyframes movePop {
  0% {
    scale: 1;
  }

  50% {
    scale: 1.1;
  }

  100% {
    scale: 1;
  }
}

@keyframes flash {
  0%,100% {
    opacity: 0;
  }

  45% {
    opacity: 1;
  }
}

@keyframes timerPulse {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.08);
  }
}

/* MOBILE */

@media (max-width: 700px) {
  .app {
    padding: 6px;
  }

  .hud-grid {
    grid-template-columns: repeat(2, 1fr);
    font-size: 0.82rem;
  }

  .panel {
    padding: 8px;
  }

  .map-board {
    aspect-ratio: 9 / 14;
  }

  .player-token {
    width: clamp(42px, 11vw, 68px);
    height: clamp(42px, 11vw, 68px);
  }

  .killer-token {
    width: clamp(52px, 13vw, 82px);
    height: clamp(52px, 13vw, 82px);
  }
}
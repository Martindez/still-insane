(function () {
  const playButton = document.getElementById("playButton");
  const loadingScreen = document.getElementById("loadingScreen");
  const menuHint = document.getElementById("menuHint");

  function startGame() {
    if (!playButton) return;

    playButton.disabled = true;
    playButton.textContent = "Loading...";
    if (menuHint) menuHint.textContent = "Do not let the rabbit catch you.";

    if (loadingScreen) {
      loadingScreen.classList.add("show");
    }

    setTimeout(() => {
      window.location.href = "./school/";
    }, 650);
  }

  playButton?.addEventListener("click", startGame);

  window.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      startGame();
    }
  });
})();
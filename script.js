const playBtn = document.getElementById("playBtn");
const readBtn = document.getElementById("readBtn");
const closeReadBtn = document.getElementById("closeReadBtn");
const readPanel = document.getElementById("readPanel");
const loading = document.getElementById("loading");

function startGame() {
  playBtn.disabled = true;
  readBtn.disabled = true;
  playBtn.textContent = "Loading...";

  loading.classList.add("show");
  loading.setAttribute("aria-hidden", "false");

  setTimeout(() => {
    window.location.href = "./school/";
  }, 650);
}

function openReadMe() {
  readPanel.classList.add("show");
  readPanel.setAttribute("aria-hidden", "false");
}

function closeReadMe() {
  readPanel.classList.remove("show");
  readPanel.setAttribute("aria-hidden", "true");
}

playBtn.addEventListener("click", startGame);
readBtn.addEventListener("click", openReadMe);
closeReadBtn.addEventListener("click", closeReadMe);

readPanel.addEventListener("click", (event) => {
  if (event.target === readPanel) closeReadMe();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeReadMe();
  if (event.key === "Enter" && !readPanel.classList.contains("show")) startGame();
});
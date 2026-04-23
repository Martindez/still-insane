const playBtn = document.getElementById("playBtn");
const level2Btn = document.getElementById("level2Btn");
const cardLevel1 = document.getElementById("cardLevel1");
const cardLevel2 = document.getElementById("cardLevel2");

function goToLevel1() {
  window.location.href = "/rabbit-escape-school/school/";
}

function goToLevel2() {
  window.location.href = "/rabbit-escape-school/pizzaria/";
}

if (playBtn) playBtn.addEventListener("click", goToLevel1);
if (level2Btn) level2Btn.addEventListener("click", goToLevel2);
if (cardLevel1) cardLevel1.addEventListener("click", goToLevel1);
if (cardLevel2) cardLevel2.addEventListener("click", goToLevel2);

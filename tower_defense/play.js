const btn = document.getElementById("target-btn");
const scoreText = document.getElementById("score");
let score = 0;

function moveButton() {
    const area = document.getElementById("game-area");
    const maxX = area.clientWidth - btn.clientWidth;
    const maxY = area.clientHeight - btn.clientHeight;

    const x = Math.random() * maxX;
    const y = Math.random() * maxY;

    btn.style.left = x + "px";
    btn.style.top = y + "px";
}

btn.addEventListener("click", () => {

    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }

    score++;
    scoreText.textContent = "Skóre: " + score;
    moveButton();
});
document.getElementById("prank").addEventListener("click", function () {
    document.getElementById("myImage").style.display = "block"; 
});
moveButton();

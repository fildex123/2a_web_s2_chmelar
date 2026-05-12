const player = document.getElementById("player");

const size = 50;
let x = window.innerWidth / 2 - size / 2;
let y = window.innerHeight / 2 - size / 2;

const speed = 5;

// aktivní klávesy
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// počáteční pozice
player.style.left = x + "px";
player.style.top = y + "px";

// držení kláves
document.addEventListener("keydown", (e) => {
    if (keys[e.key] !== undefined) keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
    if (keys[e.key] !== undefined) keys[e.key] = false;
});

// herní smyčka
function loop() {
    if (keys.w) y -= speed;
    if (keys.s) y += speed;
    if (keys.a) x -= speed;
    if (keys.d) x += speed;

    player.style.left = x + "px";
    player.style.top = y + "px";

    requestAnimationFrame(loop);
}

loop();

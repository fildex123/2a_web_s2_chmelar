// ====== Canvas setup ======
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ====== UI elements ======
const creditsEl = document.getElementById("credits");
const waveEl = document.getElementById("wave");
const enemiesLeftEl = document.getElementById("enemiesLeft");
const towerBtn = document.getElementById("towerBtn");
const startWaveBtn = document.getElementById("startWaveBtn");
const waveBanner = document.getElementById("waveBanner");

// ====== Game state ======
let credits = 100;
let waveNumber = 0;
let enemies = [];
let towers = [];
let bullets = [];
let placingTower = false;
let keys = { w: false, a: false, s: false, d: false };

// Player (just to test WASD movement)
const player = {
  x: 380,
  y: 220,
  size: 20,
  speed: 2.5
};

// Path for enemies (simple straight line)
const pathStart = { x: 0, y: 250 };
const pathEnd = { x: 800, y: 250 };

// Tower config
const TOWER_COST = 25;
const TOWER_RANGE = 120;
const TOWER_FIRE_RATE = 30; // frames between shots
const BULLET_SPEED = 5;

// Wave config
let waveInProgress = false;
let enemiesToSpawn = 0;
let spawnTimer = 0;
const SPAWN_INTERVAL = 40; // frames

// ====== Input handling ======
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "w" || k === "a" || k === "s" || k === "d") {
    keys[k] = true;
  }
});

window.addEventListener("keyup", (e) => {
  const k = e.key.toLowerCase();
  if (k === "w" || k === "a" || k === "s" || k === "d") {
    keys[k] = false;
  }
});

// Place tower with mouse
canvas.addEventListener("click", (e) => {
  if (!placingTower) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (credits >= TOWER_COST) {
    credits -= TOWER_COST;
    creditsEl.textContent = credits;

    towers.push({
      x,
      y,
      size: 24,
      range: TOWER_RANGE,
      fireCooldown: 0
    });
  }

  placingTower = false;
  towerBtn.textContent = "Basic Tower (cost 25)";
});

// ====== Buttons ======
towerBtn.addEventListener("click", () => {
  if (credits < TOWER_COST) return;
  placingTower = true;
  towerBtn.textContent = "Click on map to place";
});

startWaveBtn.addEventListener("click", () => {
  if (waveInProgress) return;
  startNextWave();
});

// ====== Wave logic ======
function startNextWave() {
  waveNumber++;
  waveEl.textContent = waveNumber;

  // Show banner briefly but DO NOT block the game loop
  waveBanner.textContent = `Wave ${waveNumber}`;
  waveBanner.classList.remove("hidden");
  waveBanner.classList.add("visible");
  setTimeout(() => {
    waveBanner.classList.remove("visible");
    waveBanner.classList.add("hidden");
  }, 1000);

  waveInProgress = true;
  enemiesToSpawn = 5 + waveNumber * 2;
  enemies = [];
  spawnTimer = 0;
}

// ====== Enemy creation ======
function spawnEnemy() {
  enemies.push({
    x: pathStart.x,
    y: pathStart.y,
    size: 18,
    speed: 1 + waveNumber * 0.1,
    hp: 3 + waveNumber
  });
}

// ====== Game loop ======
function update() {
  // Player movement (WASD)
  if (keys.w) player.y -= player.speed;
  if (keys.s) player.y += player.speed;
  if (keys.a) player.x -= player.speed;
  if (keys.d) player.x += player.speed;

  // Clamp player inside canvas
  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

  // Handle wave spawning
  if (waveInProgress) {
    if (enemiesToSpawn > 0) {
      spawnTimer--;
      if (spawnTimer <= 0) {
        spawnEnemy();
        enemiesToSpawn--;
        spawnTimer = SPAWN_INTERVAL;
      }
    }

    // If no enemies left and none to spawn, wave ends
    if (enemies.length === 0 && enemiesToSpawn === 0) {
      waveInProgress = false;
    }
  }

  // Update enemies
  enemies.forEach((enemy) => {
    // Move along straight line to the right
    const dx = pathEnd.x - enemy.x;
    const dy = pathEnd.y - enemy.y;
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      enemy.x += (dx / len) * enemy.speed;
      enemy.y += (dy / len) * enemy.speed;
    }
  });

  // Remove enemies that reached the end or died
  enemies = enemies.filter((enemy) => {
    if (enemy.hp <= 0) {
      credits += 5;
      creditsEl.textContent = credits;
      return false;
    }
    if (enemy.x > canvas.width + 30) {
      // Enemy escaped; you could reduce lives here
      return false;
    }
    return true;
  });

  // Towers: target and shoot
  towers.forEach((tower) => {
    if (tower.fireCooldown > 0) {
      tower.fireCooldown--;
      return;
    }

    // Find closest enemy in range
    let target = null;
    let closestDist = Infinity;
    enemies.forEach((enemy) => {
      const dx = enemy.x - tower.x;
      const dy = enemy.y - tower.y;
      const dist = Math.hypot(dx, dy);
      if (dist < tower.range && dist < closestDist) {
        closestDist = dist;
        target = enemy;
      }
    });

    if (target) {
      // Fire bullet
      bullets.push({
        x: tower.x,
        y: tower.y,
        size: 5,
        target
      });
      tower.fireCooldown = TOWER_FIRE_RATE;
    }
  });

  // Update bullets
  bullets.forEach((b) => {
    if (!b.target) return;
    const dx = b.target.x - b.x;
    const dy = b.target.y - b.y;
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      b.x += (dx / len) * BULLET_SPEED;
      b.y += (dy / len) * BULLET_SPEED;
    }

    // Hit detection
    const dist = Math.hypot(b.target.x - b.x, b.target.y - b.y);
    if (dist < b.target.size / 2 + b.size) {
      b.target.hp -= 1;
      b.hit = true;
    }
  });

  // Remove bullets that hit or go off-screen
  bullets = bullets.filter((b) => {
    if (b.hit) return false;
    if (b.x < -20 || b.x > canvas.width + 20 || b.y < -20 || b.y > canvas.height + 20) {
      return false;
    }
    return true;
  });

  enemiesLeftEl.textContent = enemies.length + enemiesToSpawn;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw path
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(pathStart.x, pathStart.y);
  ctx.lineTo(pathEnd.x, pathEnd.y);
  ctx.stroke();

  // Draw player
  ctx.fillStyle = "#00bfff";
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Draw towers
  towers.forEach((tower) => {
    // Range circle
    ctx.strokeStyle = "rgba(0,255,0,0.2)";
    ctx.beginPath();
    ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
    ctx.stroke();

    // Tower body
    ctx.fillStyle = "#0f0";
    ctx.fillRect(
      tower.x - tower.size / 2,
      tower.y - tower.size / 2,
      tower.size,
      tower.size
    );
  });

  // Draw enemies
  enemies.forEach((enemy) => {
    ctx.fillStyle = "#f00";
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size / 2, 0, Math.PI * 2);
    ctx.fill();

    // HP bar
    ctx.fillStyle = "#000";
    ctx.fillRect(enemy.x - 10, enemy.y - enemy.size, 20, 4);
    ctx.fillStyle = "#0f0";
    const hpRatio = Math.max(0, enemy.hp / (3 + waveNumber));
    ctx.fillRect(enemy.x - 10, enemy.y - enemy.size, 20 * hpRatio, 4);
  });

  // Draw bullets
  bullets.forEach((b) => {
    ctx.fillStyle = "#ff0";
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // If placing tower, show ghost at mouse position (optional: simple text hint)
  if (placingTower) {
    ctx.fillStyle = "rgba(0,255,0,0.4)";
    ctx.fillText("Click to place tower", 10, 20);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Init UI
creditsEl.textContent = credits;
waveEl.textContent = waveNumber;
enemiesLeftEl.textContent = 0;

// Start loop
gameLoop();

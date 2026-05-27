// ═══════════════════════════════════════════════════════════════
//  IRON BASTION — game.js
//  Clean rewrite. All bugs fixed.
// ═══════════════════════════════════════════════════════════════

// ── Constants ──────────────────────────────────────────────────
const MAP_W    = 2400;
const MAP_H    = 2400;
const BASE_X   = MAP_W / 2;
const BASE_Y   = MAP_H / 2;
const BASE_R   = 55;
const CAM_SPD  = 4;
const CAM_LIMIT= 650;   // max camera drift from base centre
const TILE     = 80;

// ── Tower definitions ──────────────────────────────────────────
const TOWER_DEFS = {
  gun:    { cost:75,  range:180, fireRate:18,  dmg:14,  splash:0,   color:'#39ff14', proj:'bullet',  chainCount:0, label:'GUNPOST' },
  cannon: { cost:150, range:210, fireRate:65,  dmg:60,  splash:55,  color:'#ffaa00', proj:'shell',   chainCount:0, label:'CANNON'  },
  laser:  { cost:250, range:250, fireRate:1,   dmg:4,   splash:0,   color:'#00aaff', proj:'laser',   chainCount:0, label:'LASER'   },
  tesla:  { cost:350, range:195, fireRate:28,  dmg:22,  splash:0,   color:'#cc44ff', proj:'arc',     chainCount:3, label:'TESLA'   },
  missile:{ cost:400, range:310, fireRate:90,  dmg:110, splash:65,  color:'#ff6600', proj:'missile', chainCount:0, label:'MISSILE' },
};

// ── Enemy tier templates ───────────────────────────────────────
const ENEMY_TIERS = [
  { maxHp:40,  spd:1.1, reward:10, r:10, color:'#ff4455', label:'SCOUT'  },
  { maxHp:110, spd:0.70,reward:20, r:13, color:'#ff8800', label:'BRUTE'  },
  { maxHp:220, spd:0.50,reward:35, r:16, color:'#cc00ff', label:'TANK'   },
  { maxHp:65,  spd:1.55,reward:15, r:9,  color:'#ff0088', label:'DASHER' },
  { maxHp:600, spd:0.30,reward:90, r:24, color:'#ff2200', label:'BOSS'   },
];

// ── Spawn points (map edges) ───────────────────────────────────
const SPAWN_POINTS = [
  { x:160,        y:160        },
  { x:MAP_W/2,    y:160        },
  { x:MAP_W-160,  y:160        },
  { x:MAP_W-160,  y:MAP_H/2   },
  { x:MAP_W-160,  y:MAP_H-160 },
  { x:MAP_W/2,    y:MAP_H-160 },
  { x:160,        y:MAP_H-160 },
  { x:160,        y:MAP_H/2   },
];

// ── Game state ─────────────────────────────────────────────────
let canvas, ctx;
let camX, camY;
let money, baseHp, wave, kills, frame;
let gameOver, waveActive;
let selectedType;
let nextWaveCountdown;  // frames until next wave
let mouseX = 0, mouseY = 0;

// Entity arrays — NEVER mutate while iterating; use pending arrays
let towers      = [];
let enemies     = [];
let projectiles = [];
let particles   = [];
let floatTexts  = [];

// Pending spawns: { tier, framesLeft }
let spawnQueue  = [];

// Key state
const keys = {};

// ── Boot ───────────────────────────────────────────────────────
window.addEventListener('load', () => {
  canvas = document.getElementById('game-canvas');
  ctx    = canvas.getContext('2d');

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  document.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
  document.addEventListener('keyup',   e => { keys[e.key.toLowerCase()] = false; });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') deselectTower();
  });

  canvas.addEventListener('click',     onCanvasClick);
  canvas.addEventListener('mousemove', onMouseMove);

  setupShopButtons();
  drawShopPreviews();
  resetState();
  requestAnimationFrame(loop);
});

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

function resetState() {
  camX  = BASE_X - canvas.width  / 2;
  camY  = BASE_Y - canvas.height / 2;
  money = 50000000000000;
  baseHp= 100;
  wave  = 0;
  kills = 0;
  frame = 0;
  gameOver = false;
  waveActive = false;
  selectedType = null;
  nextWaveCountdown = 300;  // 5-second grace period at start
  towers = []; enemies = []; projectiles = [];
  particles = []; floatTexts = []; spawnQueue = [];
  updateHUD();
}

// ── Shop setup ─────────────────────────────────────────────────
function setupShopButtons() {
  document.querySelectorAll('.tower-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const t = btn.dataset.type;
      if (TOWER_DEFS[t].cost > money) return;
      if (selectedType === t) { deselectTower(); return; }
      deselectTower();
      selectedType = t;
      btn.classList.add('selected');
    });
  });
  // Stop shop from passing clicks to canvas
  document.getElementById('shop').addEventListener('click', e => e.stopPropagation());
}

function deselectTower() {
  selectedType = null;
  document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
  document.getElementById('tooltip').style.display = 'none';
}

// Draw mini sprites in each shop button canvas
function drawShopPreviews() {
  document.querySelectorAll('.t-preview').forEach(pc => {
    const type = pc.dataset.draw;
    const c    = pc.getContext('2d');
    const def  = TOWER_DEFS[type];
    c.clearRect(0, 0, 40, 40);
    drawTowerSprite(c, 20, 20, type, def.color, 0, 1.2);
  });
}

// ── Main loop ──────────────────────────────────────────────────
function loop() {
  requestAnimationFrame(loop);
  frame++;
  if (!gameOver) {
    if(keys['n']){ beginWave(); }
    stepCamera();
    stepWave();
    stepSpawnQueue();
    stepTowers();
    stepEnemies();
    stepProjectiles();
    stepParticles();
    stepFloatTexts();
  }
  render();
}

// ── Camera ─────────────────────────────────────────────────────
function stepCamera() {
  if (keys['w'] || keys['arrowup'])    camY -= CAM_SPD;
  if (keys['s'] || keys['arrowdown'])  camY += CAM_SPD;
  if (keys['a'] || keys['arrowleft'])  camX -= CAM_SPD;
  if (keys['d'] || keys['arrowright']) camX += CAM_SPD;

  const minX = BASE_X - CAM_LIMIT - canvas.width  / 2;
  const maxX = BASE_X + CAM_LIMIT - canvas.width  / 2;
  const minY = BASE_Y - CAM_LIMIT - canvas.height / 2;
  const maxY = BASE_Y + CAM_LIMIT - canvas.height / 2;
  camX = Math.max(minX, Math.min(maxX, camX));
  camY = Math.max(minY, Math.min(maxY, camY));
}

// ── Wave management ────────────────────────────────────────────
function stepWave() {
  if (waveActive) {
    // Wave ends when nothing left to spawn and no enemies alive
    if (spawnQueue.length === 0 && enemies.length === 0) {
      waveActive = false;
      nextWaveCountdown = 480; // 8 seconds inter-wave
      const bonus = wave * 30;
      money += bonus;
      addFloatText(BASE_X, BASE_Y - 90, `+¢${bonus} WAVE BONUS`, '#ffaa00');
      showAlert('CLEAR!', '#39ff14');
      updateHUD();
    }
  } else {
    nextWaveCountdown--;
    updateTimerHUD();
    if (nextWaveCountdown <= 0) beginWave();
  }
}

function beginWave() {
  wave++;
  waveActive = true;
  updateHUD();
  showAlert(`WAVE  ${wave}`, '#ff3333');

  const count = 6 + wave * 3;
  let delay   = 60; // first enemy after 1 second

  for (let i = 0; i < count; i++) {
    const isBoss = (wave % 5 === 0) && (i === count - 1);
    let tier;
    if (isBoss) {
      tier = 4;
    } else {
      const maxTier = Math.min(3, Math.floor(wave / 2));
      tier = Math.floor(Math.random() * (maxTier + 1));
    }
    spawnQueue.push({ tier, framesLeft: delay });
    delay += 35 + Math.floor(Math.random() * 25);
  }
}

function stepSpawnQueue() {
  const stillWaiting = [];
  for (const entry of spawnQueue) {
    entry.framesLeft--;
    if (entry.framesLeft <= 0) {
      spawnEnemy(entry.tier);
    } else {
      stillWaiting.push(entry);
    }
  }
  spawnQueue = stillWaiting;
}

function spawnEnemy(tier) {
  const tmpl = ENEMY_TIERS[tier];
  const sp   = SPAWN_POINTS[Math.floor(Math.random() * SPAWN_POINTS.length)];
  enemies.push({
    ...tmpl,
    hp:    tmpl.maxHp,
    x:     sp.x + (Math.random() - 0.5) * 60,
    y:     sp.y + (Math.random() - 0.5) * 60,
    angle: 0,
    id:    Math.random(),
  });
  updateHUD();
}

// ── Towers ─────────────────────────────────────────────────────
function stepTowers() {
  for (const t of towers) {
    if (t.type === 'laser') {
      // Laser fires every frame if target in range
      const target = nearestEnemy(t.x, t.y, t.range);
      t.laserTarget = target || null;
      if (target) {
        t.angle = Math.atan2(target.y - t.y, target.x - t.x);
        target.hp -= t.dmg;
        addParticles(target.x, target.y, t.color, 1, 'spark');
        if (target.hp <= 0) killEnemy(target);
      }
      continue;
    }

    t.laserTarget = null;
    if (t.cooldown > 0) { t.cooldown--; continue; }

    const target = nearestEnemy(t.x, t.y, t.range);
    if (!target) continue;

    t.angle   = Math.atan2(target.y - t.y, target.x - t.x);
    t.cooldown = t.fireRate;

    if (t.type === 'tesla') {
      // Instant arc — collect chain targets, damage them
      const chain = [target];
      for (const e of enemies) {
        if (e === target || chain.length >= t.chainCount) continue;
        const dx = e.x - target.x, dy = e.y - target.y;
        if (Math.hypot(dx, dy) < 110) chain.push(e);
      }
      projectiles.push({ type:'arc', x:t.x, y:t.y, chain, life:8, color:t.color });
      for (const ce of chain) {
        ce.hp -= t.dmg;
        addParticles(ce.x, ce.y, t.color, 4, 'spark');
        if (ce.hp <= 0) killEnemy(ce);
      }
    } else {
      projectiles.push(makeProjectile(t, target));
    }
  }
}

function nearestEnemy(x, y, range) {
  let best = null, bd = Infinity;
  for (const e of enemies) {
    const d = Math.hypot(e.x - x, e.y - y);
    if (d < range && d < bd) { bd = d; best = e; }
  }
  return best;
}

function makeProjectile(tower, target) {
  const spd = tower.proj === 'missile' ? 4.5 : (tower.proj === 'shell' ? 5 : 11);
  const ang = Math.atan2(target.y - tower.y, target.x - tower.x);
  return {
    type:   tower.proj,
    x:      tower.x, y: tower.y,
    vx:     Math.cos(ang) * spd,
    vy:     Math.sin(ang) * spd,
    target: tower.proj === 'missile' ? target : null,
    dmg:    tower.dmg,
    splash: tower.splash,
    color:  tower.color,
    life:   140,
    r:      tower.proj === 'shell' ? 6 : tower.proj === 'missile' ? 5 : 4,
  };
}

// ── Enemies ────────────────────────────────────────────────────
function stepEnemies() {
  const toKill = [];

  for (const e of enemies) {
    const dx = BASE_X - e.x;
    const dy = BASE_Y - e.y;
    const d  = Math.hypot(dx, dy);

    if (d < BASE_R + e.r) {
      // Reached base — damage it
      baseHp -= 0.15;
      addParticles(BASE_X + (dx/d)*BASE_R, BASE_Y + (dy/d)*BASE_R, '#ff3333', 2, 'hit');
      if (baseHp <= 0 && !gameOver) triggerGameOver();
      // Push it back slightly
      e.x -= (dx/d) * 1.5;
      e.y -= (dy/d) * 1.5;
    } else {
      e.x    += (dx/d) * e.spd;
      e.y    += (dy/d) * e.spd;
      e.angle = Math.atan2(dy, dx);
    }

    // Separation from neighbours
    for (const o of enemies) {
      if (o === e) continue;
      const ox = e.x - o.x, oy = e.y - o.y;
      const od = Math.hypot(ox, oy);
      if (od > 0 && od < e.r + o.r + 2) {
        const push = (e.r + o.r + 2 - od) * 0.4 / od;
        e.x += ox * push;
        e.y += oy * push;
      }
    }
  }

  // Remove dead enemies flagged during projectile step
  // (killEnemy already splices them out safely)
  if (baseHp <= 0) baseHp = 0;
  updateHUD();
}

function killEnemy(enemy) {
  const idx = enemies.indexOf(enemy);
  if (idx === -1) return; // already removed
  enemies.splice(idx, 1);
  money += enemy.reward;
  kills++;
  addParticles(enemy.x, enemy.y, enemy.color, 16, 'death');
  addFloatText(enemy.x, enemy.y - 22, `+¢${enemy.reward}`, '#ffaa00');
  updateHUD();
}

// ── Projectiles ────────────────────────────────────────────────
function stepProjectiles() {
  const toRemove = [];

  for (const p of projectiles) {
    if (p.type === 'arc') { p.life--; continue; }

    // Homing for missiles
    if (p.target) {
      if (enemies.includes(p.target)) {
        const dx  = p.target.x - p.x, dy = p.target.y - p.y;
        const ta  = Math.atan2(dy, dx);
        const ca  = Math.atan2(p.vy, p.vx);
        let diff  = ta - ca;
        // Normalise to [-π, π]
        while (diff >  Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        const turn = Math.max(-0.1, Math.min(0.1, diff));
        const spd  = Math.hypot(p.vx, p.vy);
        const na   = ca + turn;
        p.vx = Math.cos(na) * spd;
        p.vy = Math.sin(na) * spd;
      } else {
        p.target = null; // target died, keep going straight
      }
    }

    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    if (p.life <= 0) { toRemove.push(p); continue; }

    // Hit detection
    let hit = false;
    for (const e of enemies) {
      if (Math.hypot(e.x - p.x, e.y - p.y) < e.r + p.r) {
        if (p.splash > 0) {
          // Splash: damage nearby enemies
          const toHurt = [...enemies]; // snapshot
          for (const se of toHurt) {
            const sd = Math.hypot(se.x - p.x, se.y - p.y);
            if (sd < p.splash) {
              se.hp -= p.dmg * (1 - sd / p.splash * 0.5);
              if (se.hp <= 0) killEnemy(se);
            }
          }
          addParticles(p.x, p.y, p.color, 22, 'explosion');
        } else {
          e.hp -= p.dmg;
          addParticles(p.x, p.y, p.color, 5, 'hit');
          if (e.hp <= 0) killEnemy(e);
        }
        toRemove.push(p);
        hit = true;
        break;
      }
    }
  }

  // Remove spent projectiles
  for (const p of toRemove) {
    const i = projectiles.indexOf(p);
    if (i !== -1) projectiles.splice(i, 1);
  }
}

// ── Particles ──────────────────────────────────────────────────
function addParticles(x, y, color, count, type) {
  for (let i = 0; i < count; i++) {
    const ang = Math.random() * Math.PI * 2;
    const spd = type === 'explosion' ? 3 + Math.random() * 4 :
                type === 'death'     ? 2 + Math.random() * 3 :
                type === 'build'     ? 1.5 + Math.random() * 2.5 :
                                       0.5 + Math.random() * 2;
    const life = type === 'explosion' ? 35 + Math.random() * 20 :
                 type === 'death'     ? 28 + Math.random() * 14 :
                                        14 + Math.random() * 10;
    particles.push({
      x, y,
      vx: Math.cos(ang) * spd,
      vy: Math.sin(ang) * spd,
      color,
      life,
      maxLife: life,
      r: type === 'explosion' ? 2.5 + Math.random() * 2.5 : 1.5 + Math.random() * 1.5,
    });
  }
}

function stepParticles() {
  for (const p of particles) {
    p.x  += p.vx;
    p.y  += p.vy;
    p.vx *= 0.90;
    p.vy *= 0.90;
    p.life--;
  }
  particles = particles.filter(p => p.life > 0);
}

// ── Float texts ────────────────────────────────────────────────
function addFloatText(x, y, text, color) {
  floatTexts.push({ x, y, text, color, life: 60, maxLife: 60 });
}

function stepFloatTexts() {
  for (const f of floatTexts) { f.y -= 0.7; f.life--; }
  floatTexts = floatTexts.filter(f => f.life > 0);
}

// ── Canvas click — place tower ─────────────────────────────────
function onCanvasClick(e) {
  if (!selectedType || gameOver) return;
  const def = TOWER_DEFS[selectedType];
  if (money < def.cost) { flashMoney(); return; }

  const wx = e.clientX + camX;
  const wy = e.clientY + camY;

  // Too close to base
  if (Math.hypot(wx - BASE_X, wy - BASE_Y) < BASE_R + 35) return;

  // Overlap with existing tower
  for (const t of towers) {
    if (Math.hypot(t.x - wx, t.y - wy) < 38) return;
  }

  money -= def.cost;
  towers.push({
    x: wx, y: wy,
    type:      selectedType,
    color:     def.color,
    range:     def.range,
    fireRate:  def.fireRate,
    dmg:       def.dmg,
    splash:    def.splash,
    proj:      def.proj,
    chainCount:def.chainCount,
    cooldown:  0,
    angle:     0,
    laserTarget: null,
  });
  addParticles(wx, wy, def.color, 14, 'build');
  updateHUD();
}

function onMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  const tooltip = document.getElementById('tooltip');
  if (selectedType) {
    const def = TOWER_DEFS[selectedType];
    tooltip.style.display = 'block';
    tooltip.style.left = (e.clientX + 18) + 'px';
    tooltip.style.top  = (e.clientY - 12) + 'px';
    tooltip.textContent = `${def.label}  ·  Range ${def.range}  ·  DMG ${def.dmg}${def.splash ? '  ·  Splash ' + def.splash : ''}`;
  } else {
    tooltip.style.display = 'none';
  }
}

// ── Render ─────────────────────────────────────────────────────
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-camX, -camY);

  drawGrid();
  drawSpawnMarkers();
  drawBase();
  drawTowers();
  drawLasers();
  drawProjectiles();
  drawEnemies();
  drawParticles();
  drawFloatTexts();
  drawPlacementGhost();

  ctx.restore();

  drawRadar();
}

// ── Grid ───────────────────────────────────────────────────────
function drawGrid() {
  ctx.strokeStyle = 'rgba(30,45,30,0.30)';
  ctx.lineWidth   = 1;

  const x0 = Math.floor(camX / TILE) * TILE;
  const y0 = Math.floor(camY / TILE) * TILE;

  for (let x = x0; x < camX + canvas.width  + TILE; x += TILE) {
    ctx.beginPath(); ctx.moveTo(x, camY); ctx.lineTo(x, camY + canvas.height); ctx.stroke();
  }
  for (let y = y0; y < camY + canvas.height + TILE; y += TILE) {
    ctx.beginPath(); ctx.moveTo(camX, y); ctx.lineTo(camX + canvas.width, y); ctx.stroke();
  }

  // Map border
  ctx.strokeStyle = 'rgba(57,255,20,0.12)';
  ctx.lineWidth   = 3;
  ctx.strokeRect(0, 0, MAP_W, MAP_H);
}

function drawSpawnMarkers() {
  for (const sp of SPAWN_POINTS) {
    const ang = Math.atan2(BASE_Y - sp.y, BASE_X - sp.x);
    ctx.strokeStyle = 'rgba(255,50,50,0.18)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,50,50,0.04)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,50,50,0.25)';
    ctx.beginPath();
    ctx.moveTo(sp.x, sp.y);
    ctx.lineTo(sp.x + Math.cos(ang)*60, sp.y + Math.sin(ang)*60);
    ctx.stroke();
  }
}

// ── Base ───────────────────────────────────────────────────────
function drawBase() {
  const hpRatio  = Math.max(0, baseHp / 100);
  const pulse    = 0.55 + 0.45 * Math.sin(frame * 0.04);
  const bCol     = hpRatio > 0.5 ? '#39ff14' : hpRatio > 0.25 ? '#ffaa00' : '#ff3333';

  // Ambient glow rings
  for (let i = 3; i >= 1; i--) {
    ctx.beginPath();
    ctx.arc(BASE_X, BASE_Y, BASE_R + i * 18 + pulse * 4, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(57,255,20,${0.035 * i * pulse})`;
    ctx.lineWidth   = 2;
    ctx.stroke();
  }

  // HP arc
  ctx.beginPath();
  ctx.arc(BASE_X, BASE_Y, BASE_R + 9, -Math.PI/2, -Math.PI/2 + Math.PI*2*hpRatio);
  ctx.strokeStyle = bCol;
  ctx.lineWidth   = 4;
  ctx.shadowColor = bCol;
  ctx.shadowBlur  = 10;
  ctx.stroke();
  ctx.shadowBlur  = 0;

  // Body fill
  ctx.beginPath();
  ctx.arc(BASE_X, BASE_Y, BASE_R, 0, Math.PI * 2);
  ctx.fillStyle = '#080a0c';
  ctx.fill();
  ctx.strokeStyle = bCol;
  ctx.lineWidth   = 2;
  ctx.stroke();

  // Inner hex lines
  for (let i = 0; i < 6; i++) {
    const a  = (i / 6) * Math.PI * 2 + frame * 0.006;
    ctx.strokeStyle = `rgba(57,255,20,${0.25 * pulse})`;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(BASE_X + Math.cos(a)*18, BASE_Y + Math.sin(a)*18);
    ctx.lineTo(BASE_X + Math.cos(a)*44, BASE_Y + Math.sin(a)*44);
    ctx.stroke();
  }

  // Label
  ctx.fillStyle  = bCol;
  ctx.font       = `bold 9px 'Share Tech Mono', monospace`;
  ctx.textAlign  = 'center';
  ctx.shadowColor = bCol;
  ctx.shadowBlur  = 6;
  ctx.fillText('BASTION', BASE_X, BASE_Y + 4);
  ctx.shadowBlur  = 0;
  ctx.textAlign  = 'left';
}

// ── Tower drawing ──────────────────────────────────────────────
function drawTowers() {
  for (const t of towers) {
    // Subtle range ring
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.range, 0, Math.PI * 2);
    ctx.strokeStyle = `${t.color}0d`;
    ctx.lineWidth   = 1;
    ctx.stroke();

    drawTowerSprite(ctx, t.x, t.y, t.type, t.color, t.angle, 1);
  }
}

// Reusable sprite draw (used for both world and shop previews)
// scale=1 for world, scale=1.2 for shop previews
function drawTowerSprite(c, x, y, type, color, angle, scale) {
  // Platform
  c.beginPath();
  c.arc(x, y, 17 * scale, 0, Math.PI * 2);
  c.fillStyle = '#0d1216';
  c.fill();
  c.strokeStyle = color;
  c.lineWidth   = 1.5;
  c.stroke();

  // Barrel / head
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.scale(scale, scale);
  c.fillStyle = color;
  c.shadowColor = color;
  c.shadowBlur  = 6;

  switch (type) {
    case 'gun':
      // Thin fast barrel
      c.fillRect(2, -2.5, 18, 5);
      c.beginPath();
      c.arc(0, 0, 6, 0, Math.PI * 2);
      c.fill();
      break;
    case 'cannon':
      // Fat short barrel
      c.fillRect(2, -5, 16, 10);
      c.beginPath();
      c.arc(0, 0, 7, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#000';
      c.beginPath();
      c.arc(18, 0, 4, 0, Math.PI * 2);
      c.fill();
      break;
    case 'laser':
      // Sleek long barrel
      c.fillRect(2, -2, 22, 4);
      c.beginPath();
      c.arc(0, 0, 6, 0, Math.PI * 2);
      c.fill();
      // Glowing tip
      c.shadowBlur = 14;
      c.beginPath();
      c.arc(24, 0, 3.5, 0, Math.PI * 2);
      c.fill();
      break;
    case 'tesla':
      // Orb on a short arm
      c.fillRect(2, -2.5, 14, 5);
      c.beginPath();
      c.arc(0, 0, 6, 0, Math.PI * 2);
      c.fill();
      c.shadowBlur = 16;
      c.beginPath();
      c.arc(18, 0, 6, 0, Math.PI * 2);
      c.fill();
      break;
    case 'missile':
      // Launcher box
      c.fillRect(2, -6, 14, 12);
      c.fillStyle = '#ff8800';
      c.fillRect(14, -4, 8, 4);
      c.fillRect(14,  0, 8, 4);
      c.beginPath();
      c.arc(0, 0, 7, 0, Math.PI * 2);
      c.fillStyle = color;
      c.fill();
      break;
  }

  c.shadowBlur = 0;
  c.restore();

  // Centre dot
  c.beginPath();
  c.arc(x, y, 3.5 * scale, 0, Math.PI * 2);
  c.fillStyle   = color;
  c.shadowColor = color;
  c.shadowBlur  = 8;
  c.fill();
  c.shadowBlur  = 0;
}

// ── Laser beams ────────────────────────────────────────────────
function drawLasers() {
  for (const t of towers) {
    if (t.type !== 'laser' || !t.laserTarget) continue;
    const flicker = 0.65 + 0.35 * Math.random();
    ctx.beginPath();
    ctx.moveTo(t.x, t.y);
    ctx.lineTo(t.laserTarget.x, t.laserTarget.y);
    ctx.strokeStyle = `rgba(0,170,255,${0.85 * flicker})`;
    ctx.lineWidth   = 1.5 + Math.random() * 2;
    ctx.shadowColor = '#00aaff';
    ctx.shadowBlur  = 12;
    ctx.stroke();
    ctx.shadowBlur  = 0;
  }
}

// ── Projectiles ────────────────────────────────────────────────
function drawProjectiles() {
  for (const p of projectiles) {
    if (p.type === 'arc') {
      let prev = { x: p.x, y: p.y };
      for (const ce of p.chain) {
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        const mx = (prev.x + ce.x) / 2 + (Math.random() - 0.5) * 38;
        const my = (prev.y + ce.y) / 2 + (Math.random() - 0.5) * 38;
        ctx.quadraticCurveTo(mx, my, ce.x, ce.y);
        ctx.strokeStyle = p.color;
        ctx.lineWidth   = 1.5;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 10;
        ctx.stroke();
        ctx.shadowBlur  = 0;
        prev = ce;
      }
      continue;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.atan2(p.vy, p.vx));
    ctx.shadowColor = p.color;
    ctx.shadowBlur  = 8;

    switch (p.type) {
      case 'bullet':
        ctx.fillStyle = p.color;
        ctx.fillRect(-5, -2, 9, 4);
        break;
      case 'shell':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'missile':
        ctx.fillStyle = '#ff6600';
        ctx.fillRect(-7, -3, 14, 6);
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(5, -2, 5, 4);
        // Exhaust trail
        for (let i = 1; i <= 4; i++) {
          ctx.globalAlpha = 0.4 / i;
          ctx.fillStyle   = '#ff4400';
          ctx.beginPath();
          ctx.ellipse(-7 - i*4, 0, 3, 2 + i*0.5, 0, 0, Math.PI*2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        break;
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

// ── Enemies ────────────────────────────────────────────────────
function drawEnemies() {
  for (const e of enemies) {
    const hpRatio = e.hp / e.maxHp;

    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle - Math.PI / 2); // face direction of travel

    // Drop shadow
    ctx.beginPath();
    ctx.ellipse(2, 3, e.r * 0.75, e.r * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.arc(0, 0, e.r, 0, Math.PI * 2);
    ctx.fillStyle = e.color;
    ctx.shadowColor = e.color;
    ctx.shadowBlur  = 8;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner cockpit ring
    ctx.beginPath();
    ctx.arc(0, 0, e.r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle   = 'rgba(0,0,0,0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth   = 1;
    ctx.stroke();

    // Forward chevron
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.beginPath();
    ctx.moveTo( 0,       -e.r * 0.38);
    ctx.lineTo(-e.r*0.22, e.r * 0.18);
    ctx.lineTo( 0,        e.r * 0.0);
    ctx.lineTo( e.r*0.22, e.r * 0.18);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // HP bar (always horizontal, not rotated)
    const bw = e.r * 2.4;
    const bx = e.x - bw / 2;
    const by = e.y - e.r - 9;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(bx, by, bw, 4);
    ctx.fillStyle = hpRatio > 0.5 ? '#39ff14' : hpRatio > 0.25 ? '#ffaa00' : '#ff3333';
    ctx.fillRect(bx, by, bw * hpRatio, 4);
  }
}

// ── Particles ──────────────────────────────────────────────────
function drawParticles() {
  for (const p of particles) {
    const a = p.life / p.maxLife;
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * a, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ── Float texts ────────────────────────────────────────────────
function drawFloatTexts() {
  for (const f of floatTexts) {
    const a = f.life / f.maxLife;
    ctx.globalAlpha = a;
    ctx.fillStyle   = f.color;
    ctx.font        = `bold 13px 'Orbitron', monospace`;
    ctx.textAlign   = 'center';
    ctx.fillText(f.text, f.x, f.y);
    ctx.textAlign   = 'left';
  }
  ctx.globalAlpha = 1;
}

// ── Placement ghost ────────────────────────────────────────────
function drawPlacementGhost() {
  if (!selectedType || gameOver) return;
  const wx  = mouseX + camX;
  const wy  = mouseY + camY;
  const def = TOWER_DEFS[selectedType];
  const ok  = money >= def.cost;

  ctx.beginPath();
  ctx.arc(wx, wy, def.range, 0, Math.PI * 2);
  ctx.strokeStyle = ok ? `${def.color}33` : '#ff333333';
  ctx.lineWidth   = 1;
  ctx.setLineDash([6, 5]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Ghost tower
  ctx.globalAlpha = 0.55;
  drawTowerSprite(ctx, wx, wy, selectedType, ok ? def.color : '#ff3333', 0, 1);
  ctx.globalAlpha = 1;
}

// ── Radar ──────────────────────────────────────────────────────
function drawRadar() {
  const rW = 96, rH = 96;
  const rX = canvas.width  - rW - 16;
  const rY = canvas.height - rH - 50;
  const sc = rW / MAP_W;

  ctx.save();

  // Panel
  ctx.fillStyle   = 'rgba(8,11,14,0.92)';
  ctx.strokeStyle = '#1e2d1e';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.rect(rX - 4, rY - 4, rW + 8, rH + 8);
  ctx.fill();
  ctx.stroke();

  // Clip
  ctx.beginPath();
  ctx.rect(rX, rY, rW, rH);
  ctx.clip();

  // Grid
  ctx.strokeStyle = 'rgba(30,45,30,0.5)';
  ctx.lineWidth   = 0.5;
  for (let i = 0; i <= 4; i++) {
    const xi = rX + i * rW / 4, yi = rY + i * rH / 4;
    ctx.beginPath(); ctx.moveTo(xi, rY); ctx.lineTo(xi, rY + rH); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(rX, yi); ctx.lineTo(rX + rW, yi); ctx.stroke();
  }

  // Towers
  for (const t of towers) {
    ctx.beginPath();
    ctx.arc(rX + t.x*sc, rY + t.y*sc, 2.5, 0, Math.PI*2);
    ctx.fillStyle = t.color;
    ctx.fill();
  }

  // Enemies
  for (const e of enemies) {
    ctx.beginPath();
    ctx.arc(rX + e.x*sc, rY + e.y*sc, 2, 0, Math.PI*2);
    ctx.fillStyle = e.color;
    ctx.fill();
  }

  // Base
  ctx.beginPath();
  ctx.arc(rX + BASE_X*sc, rY + BASE_Y*sc, 4, 0, Math.PI*2);
  ctx.fillStyle   = '#39ff14';
  ctx.shadowColor = '#39ff14';
  ctx.shadowBlur  = 6;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Camera view rect
  ctx.strokeStyle = 'rgba(57,255,20,0.45)';
  ctx.lineWidth   = 1;
  ctx.strokeRect(rX + camX*sc, rY + camY*sc, canvas.width*sc, canvas.height*sc);

  ctx.restore();

  // Label
  ctx.fillStyle = '#4a6a4a';
  ctx.font      = '8px "Share Tech Mono", monospace';
  ctx.fillText('RADAR', rX, rY + rH + 14);
}

// ── HUD helpers ────────────────────────────────────────────────
function updateHUD() {
  document.getElementById('hud-money').textContent   = Math.floor(money);
  const hpEl = document.getElementById('hud-hp');
  hpEl.textContent = Math.max(0, Math.floor(baseHp));
  hpEl.className   = 'hud-value' + (baseHp > 60 ? '' : baseHp > 30 ? ' amber' : ' red');
  document.getElementById('hud-wave').textContent    = wave;
  document.getElementById('hud-enemies').textContent = enemies.length + spawnQueue.length;
  document.getElementById('hud-kills').textContent   = kills;

  // Disable buttons player can't afford
  document.querySelectorAll('.tower-btn').forEach(btn => {
    const cost = TOWER_DEFS[btn.dataset.type].cost;
    btn.classList.toggle('cant-afford', money < cost);
  });
}

function updateTimerHUD() {
  const el = document.getElementById('hud-timer');
  if (waveActive) {
    el.textContent = '—';
  } else {
    const secs = Math.ceil(nextWaveCountdown / 60);
    el.textContent = secs + 's';
  }
}

let alertTO = null;
function showAlert(text, color) {
  const el = document.getElementById('wave-alert');
  el.textContent     = text;
  el.style.color     = color;
  el.style.textShadow= `0 0 40px ${color}`;
  el.style.opacity   = '1';
  clearTimeout(alertTO);
  alertTO = setTimeout(() => { el.style.opacity = '0'; }, 2200);
}

function flashMoney() {
  const el = document.getElementById('hud-money');
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 350);
}

// ── Game over ──────────────────────────────────────────────────
function triggerGameOver() {
  gameOver = true;
  document.getElementById('overlay-sub').textContent =
    `Wave ${wave}  ·  ${kills} enemies eliminated`;
  document.getElementById('overlay').classList.add('show');
}
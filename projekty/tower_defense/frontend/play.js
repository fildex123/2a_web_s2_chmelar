// ─── Stav ────────────────────────────────────────────────────────────────────
let worldX = 0, worldY = 0;       // offset kamery (kolik jsme posunuli pohled)
let playerX = 0, playerY = 0;     // pozice hráče ve světových souřadnicích
const SPEED = 4;
const keysDown = {};

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const player = document.getElementById('player');
  generateGrass(100);
  startLoop();
  updateAll();

  document.addEventListener('click', e => {

    if(ruka=='player')
    {// Kde je hráč teď na obrazovce?
    const screenPlayerX = playerX - worldX + window.innerWidth  / 2;
    const screenPlayerY = playerY - worldY + window.innerHeight / 2;

    // Trail od aktuální screen pozice hráče ke kliku
    drawTrail(screenPlayerX, screenPlayerY, e.clientX, e.clientY);

    // Převedeme klik na world souřadnice a přesuneme hráče
    playerX = e.clientX - window.innerWidth  / 2 + worldX;
    playerY = e.clientY - window.innerHeight / 2 + worldY;

    updateAll();

    }
    
  });
});

// ─── Smyčka ───────────────────────────────────────────────────────────────────
function startLoop() {
  document.addEventListener('keydown', e => keysDown[e.key.toLowerCase()] = true);
  document.addEventListener('keyup',   e => keysDown[e.key.toLowerCase()] = false);

  function tick() {
    let dx = 0, dy = 0;
    if (keysDown['w'] || keysDown['arrowup'])    dy -= SPEED;
    if (keysDown['s'] || keysDown['arrowdown'])  dy += SPEED;
    if (keysDown['a'] || keysDown['arrowleft'])  dx -= SPEED;
    if (keysDown['d'] || keysDown['arrowright']) dx += SPEED;

    if (dx !== 0 || dy !== 0) {
      worldX += dx;
      worldY += dy;
      updateAll();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ─── Přepočítej pozice ────────────────────────────────────────────────────────
// Vše se vykresluje relativně ke středu obrazovky.
// screen_pos = world_pos - worldOffset + střed_obrazovky
  function updateAll() {
  const player = document.getElementById('player');
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;

  // Hráč
  player.style.position  = 'fixed';
  player.style.left = '0';
  player.style.top  = '0';
  player.style.transform = `translate(${playerX - worldX + cx}px, ${playerY - worldY + cy}px) translate(-50%, -50%)`;

  // Objekty světa (tráva, bambusy...)
  document.querySelectorAll('.in-game').forEach(el => {
    const ox = parseFloat(el.dataset.ox);
    const oy = parseFloat(el.dataset.oy);
    el.style.position  = 'fixed';
    el.style.left = '0';
    el.style.top  = '0';
    const tx = ox - worldX + cx;
    const ty = oy - worldY + cy;
    const angle = el.dataset.angle ?? null;

    el.style.transform = angle !== null
      ? `translate(${tx}px, ${ty}px) rotate(${angle}deg)`
      : `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
  });
}

// ─── Generování trávy ─────────────────────────────────────────────────────────
function generateGrass(count = 100) {
  const base  = './img/dopln';
  const imgs  = ['bambus.png', 'bambus2.png', 'trava.png', 'trava2.png'];
  const SPACE = 800;

  for (let i = 0; i < count; i++) {
    const img  = document.createElement('img');
    const name = imgs[Math.floor(Math.random() * imgs.length)];
    img.src = `${base}/${name}`;
    img.classList.add('in-game');

    img.style.height = name.startsWith('bambus2') ? '120px'
                      : name.startsWith('bambus')  ? '60px'
                      : '14px';

    // Spawn pozice ve světových souřadnicích, střed = 0,0
    img.dataset.ox = (Math.random() - .5) * 2 * (window.innerWidth  + SPACE);
    img.dataset.oy = (Math.random() - .5) * 2 * (window.innerHeight + SPACE);

    document.body.appendChild(img);
  }
}

document.addEventListener('contextmenu', (e) => e.preventDefault()); // pravé tlačítko
document.addEventListener('selectstart', (e) => e.preventDefault()); // selection
document.addEventListener('dblclick', (e) => e.preventDefault());    // dvojklik

// ─── Trail ────────────────────────────────────────────────────────────────────
function drawTrail(x1Screen, y1Screen, x2Screen, y2Screen) {
  const cx0 = window.innerWidth  / 2;
  const cy0 = window.innerHeight / 2;

  const dx     = x2Screen - x1Screen;
  const dy     = y2Screen - y1Screen;
  const length = Math.hypot(dx, dy);

  const nx = -dy / length;
  const ny =  dx / length;

  const count = Math.floor(length/6);

  for (let i = 0; i < count; i++) {
    const t = i / count;

    [-1, 1].forEach(side => {
      const spread = side * 20;

      const sx = x1Screen + dx * t + nx * spread;
      const sy = y1Screen + dy * t + ny * spread;

      const el = document.createElement('div');
      el.classList.add('in-game');
      Object.assign(el.style, {
        width:  '4px',
        height: '4px',
        pointerEvents: 'none',
        background: '#2f501e77',
        opacity: '1',
        position: 'fixed',
        left: '0',
        top:  '0',
      });

      const startOx = sx - cx0 + worldX;
      const startOy = sy - cy0 + worldY;
      el.dataset.ox = startOx;
      el.dataset.oy = startOy;
      el.dataset.angle = 0;

      document.body.appendChild(el);

      const maxSpread = 6 + (1 - t) * 100;
      const duration  = 350 + (1 - t) * 200;
      const startTime = performance.now();

      function animate(now) {
        const cx = window.innerWidth  / 2;
        const cy = window.innerHeight / 2;

        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);

        const ox = startOx + nx * side * eased * maxSpread;
        const oy = startOy + ny * side * eased * maxSpread;

        el.dataset.ox = ox;
        el.dataset.oy = oy;
        el.style.transform = `translate(${ox - worldX + cx}px, ${oy - worldY + cy}px)`;

        if (progress > 0.6) {
          el.style.opacity = String(1 - (progress - 0.6) / 0.4);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          el.remove();
        }
      }

      requestAnimationFrame(animate);
    });
  }
}


let ruka = "player";
const actSki = document.getElementById('item-selected');
setSkillImg("player");
function setSkillImg(name){
  ruka=name;
  name += ".png"
  if(!actSki.firstChild){
    let img = document.createElement('img');
    actSki.appendChild(img);
  }
  actSki.firstChild.src='/projekty/tower_defense/frontend/img/SelectSkillImg/' + name;
  
}
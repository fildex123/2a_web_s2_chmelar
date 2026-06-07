// ─── Stav ────────────────────────────────────────────────────────────────────
let worldX = 0, worldY = 0;       // offset kamery (kolik jsme posunuli pohled)
let playerX = 0, playerY = 0;     // pozice hráče ve světových souřadnicích
const SPEED = 8;
const keysDown = {};
const towerBar = document.getElementById('towerBar');
const heroBar = document.getElementById('heroFrame');
const home = document.getElementById("home");
const pause = document.getElementById('pauseBtn');
pause.addEventListener('click', togglePause);
const FSbtn = document.getElementById('full_screen');
const elem = document.documentElement;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
FSbtn.addEventListener('click' , () => {
  if (!document.fullscreenElement) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { // Safari
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // starý Edge/IE
      elem.msRequestFullscreen();
    }
  } else {
    // Vypnout fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
});

// ─── Pause System ─────────────────────────────────────────────────────────────
window._gamePaused = false;

function pauseGame() {
  if (window._gamePaused) return;
  window._gamePaused = true;

  // Stop all behavior ticks
  (window._gameEntities ?? []).forEach(e => {
    e.behavior?.stopTick();
  });

  // Freeze all animations on their current frame
  (window._gameEntities ?? []).forEach(e => {
    if (e.anim?._timer) {
      clearInterval(e.anim._timer);
      e.anim._timer = null;
      e.anim._paused = true;
    }
  });
}

function resumeGame() {
  if (!window._gamePaused) return;
  window._gamePaused = false;

  // Restart all behavior ticks
  (window._gameEntities ?? []).forEach(e => {
    if (e.behavior && e.stats?.alive !== false) {
      e.behavior.startTick(30);
    }
  });

  // Resume animations
  (window._gameEntities ?? []).forEach(e => {
    if (e.anim?._paused && e.anim.currentAnim) {
      e.anim._paused = false;
      e.anim.play(e.anim.currentAnim); // replays from frame 0 — acceptable for loops
    }
  });
}

function togglePause() {
  window._gamePaused ? resumeGame() : pauseGame();
}



let skills = {
  player: (e) => {

    const bh = window._playerEntity;
    if (!bh || !bh.stats.alive) return;

    if (ruka !== 'player') return;
    if (!bh.stats.alive) return;
    
    const screenX = bh.stats.x - worldX + window.innerWidth  / 2;
    const screenY = bh.stats.y - worldY + window.innerHeight / 2;

    bh.stats.moveTo(
      e.clientX - window.innerWidth  / 2 + worldX,
      e.clientY - window.innerHeight / 2 + worldY
    );

    playerX = bh.stats.x;
    playerY = bh.stats.y;}
};
let enemies ={};

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {


  const player = document.getElementById('player');
  generateGrass(100);
  startLoop();
  updateAll();

  
});

// ─── Smyčka ───────────────────────────────────────────────────────────────────
function startLoop() {
  document.addEventListener('keydown', e => keysDown[e.key.toLowerCase()] = true);
  document.addEventListener('keyup',   e => keysDown[e.key.toLowerCase()] = false);

  function tick() {
    if (!window._gamePaused) {
      let dx = 0, dy = 0;
      if (keysDown['w'] || keysDown['arrowup'])    dy -= SPEED;
      if (keysDown['s'] || keysDown['arrowdown'])  dy += SPEED;
      if (keysDown['a'] || keysDown['arrowleft'])  dx -= SPEED;
      if (keysDown['d'] || keysDown['arrowright']) dx += SPEED;

      if (dx !== 0 || dy !== 0) {
        worldX += dx;
        worldY += dy;
      }
  }
      updateAll();
      requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ─── Přepočítej pozice ────────────────────────────────────────────────────────
// Vše se vykresluje relativně ke středu obrazovky.
// screen_pos = world_pos - worldOffset + střed_obrazovky
  function updateAll() {
  const cx = window.innerWidth  / 2;
  const cy = window.innerHeight / 2;


  // Objekty světa (tráva, bambusy...)
    document.querySelectorAll('.in-game').forEach(el => {
    const ox = parseFloat(el.dataset.ox);
    const oy = parseFloat(el.dataset.oy);
    const flip = el.dataset.flip === '-1' ? ' scaleX(-1)' : '';
    el.style.position = 'fixed';
    el.style.left = '0';
    el.style.top  = '0';
    const tx = ox - worldX + cx;
    const ty = oy - worldY + cy;
    const angle = el.dataset.angle ?? null;

    el.style.transform = angle !== null
      ? `translate(${tx}px, ${ty}px) rotate(${angle}deg)${flip}`
      : `translate(${tx}px, ${ty}px) translate(-50%, -50%)${flip}`;
  });
}

// ─── Generování trávy ─────────────────────────────────────────────────────────
function generateGrass(count = 100) {
  const SPACE = 800;
 
  const variants = [
    { imgSrc: './img/dopln/trava.png',   width: 60, height: 15 },
    { imgSrc: './img/dopln/trava2.png',  width: 60, height: 15 },
    { imgSrc: './img/dopln/bambus.png',  width: 20, height: 40 },
    { imgSrc: './img/dopln/bambus2.png', width: 40, height: 80 },
  ];
 
  for (let i = 0; i < count; i++) {
    const v = variants[Math.floor(Math.random() * variants.length)];
 
    spawnEntity({
      x: (Math.random() - .5) * 2 * (window.innerWidth  + SPACE),
      y: (Math.random() - .5) * 2 * (window.innerHeight + SPACE),
      tags: ['decor'],
      imgSrc:  v.imgSrc,
      width:   v.width,
      height:  v.height,
      startTick: false,
    });
  }
}

document.addEventListener('contextmenu', (e) => e.preventDefault()); // pravé tlačítko
document.addEventListener('selectstart', (e) => e.preventDefault()); // selection
document.addEventListener('dblclick', (e) => e.preventDefault());    // dvojklik



let ruka = "player";
const actSki = document.getElementById('item-selected');
setSkillImg("player");

function setSkillImg(name){
  ruka=name;
  if(!actSki.firstChild){
    let img = document.createElement('img');
    actSki.appendChild(img);
  }
  actSki.firstChild.src='./img/SelectSkillImg/' + name + '.png';
  
}


document.getElementById('heroBar').addEventListener('click', (e) => {
  e.stopPropagation();
  setSkillImg("player");
});

const towerFolder = './img/towerIcons';
const towerArray  = ['spikes', 'basicNinja'];

async function buildTowerBar() {
  const bar = document.getElementById('towerBarFiller');

  towerArray.forEach(async(name) => {
    const frame = document.createElement('div');
    frame.classList.add('ui', 'tower-slot');
    frame.dataset.tower = name;

    const icon = document.createElement('div');
    icon.classList.add('tower-icon');
    icon.style.backgroundImage = `url('${towerFolder}/${name}.png')`;

    const frameImg = document.createElement('div');
    frameImg.classList.add('tower-frame');

    frame.appendChild(icon);
    frame.appendChild(frameImg);
    bar.appendChild(frame);

    frame.addEventListener('click', (e) => {
      e.stopPropagation();
      setSkillImg(name);
    });

    //get info from api
    let tags = null;
    let statConf = null;
    let animConf = null;
    
    try {
      const response = await fetch(`ninjatower.up.railway.app/api/tower-type/${name}`);

      if (!response.ok) {
        throw new Error(`Typ věže '${name}' nebyl nalezen.`);
      }

      const data = await response.json();

      tags = data.tags;
      statConf = data.stats_config;
      animConf = data.anim_config;

      console.log(`Konfigurace pro '${name}' úspěšně načtena!`);

    } catch (error) {
      console.error("Chyba při načítání šablony z databáze:", error);
    }
    
  skills[name] = (e) => {
    spawnEntity({
      x: e.clientX - window.innerWidth  / 2 + worldX, y: e.clientY - window.innerHeight / 2 + worldY,
      scale: 5,
      width: 14, height: 14,
      tags: tags,
      statsConfig: statConf,
      animConfig: animConf
});

};


  });
}

buildTowerBar();



document.addEventListener('click', (e) => {
  if (e.target.closest('.ui')) return;
  if (window._gamePaused) return; 

  if (skills[ruka]) {
    skills[ruka](e);
  } else {
    console.warn("Neznámá akce:", ruka);
  }
});


let coins=0;
let baseHealth = 100;
let baseMaxHealth = 100;
const cointext =document.getElementById('coinText');
const healthText =document.getElementById('healthText');
const healthFiller = document.getElementById('basefill');

updateCoins(0);
updateBaseHealth(0);

function updateCoins(amount) {
  if(coins < -amount && amount >= 0 )
    return false
  coins += amount;
  cointext.innerHTML="coins: " + coins;
  return true;
};

function updateBaseHealth(amount) {
  baseHealth += amount;
  if (baseHealth > baseMaxHealth) { baseHealth = baseMaxHealth; }
  healthText.innerHTML = "health: " + baseHealth;
  healthFiller.style.width = (baseHealth / baseMaxHealth * 100) + "%"; 
  if (baseHealth <= 0) { baseHealth = 0; GameOver(); }// if you have a health bar
}

function GameOver(){
  //api ulož skóre vymaž game section data
  console.log('youlose');
}

async function getDataOfGame(username,password) {
  //získá data z databáse o konkrétním hráiči a jeho hře.
  console.log('downlowding game data');
  playerX = 0
  playerY = 0;
  baseHealth =100;
  baseMaxHealth = 100;
  coins = 0;
  let score =0;
  let level = 1;
  let playerHealth = 50;
  let playerMaxHealth = 50;
  let playerClasses = "";
  let baseClasses = "";
  let playerAtk = 2;
  let baseAtk = 2;

  try {
    const response = await fetch("ninjatower.up.railway.app/api/base/get-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      throw new Error("Chyba při komunikaci se serverem");
    }

    const data = await response.json();

    if (data.baseData) {
      const bd = data.baseData;
      
      playerX = bd.herox;
      playerY = bd.heroy;
      baseHealth = bd.base_health;
      baseMaxHealth = bd.base_max_health;
      coins = bd.coins;
      score = bd.score;
      level = bd.level;
      playerHealth = bd.hero_health;
      playerMaxHealth = bd.hero_max_health;
      playerClasses = bd.hero_classes;
      baseClasses = bd.base_classes;
      playerAtk = bd.playeratkdmg;
      baseAtk = bd.baseatkdmg;

      console.log("Herní proměnné byly úspěšně přepsány daty z databáze!");
    } else {
      console.log(data.msg); // Uživatel ověřen, ale nemá základnu
    }

  } catch (error) {
    console.error("Došlo k chybě při stahování dat, používám defaulty:", error);
  }


  // a taky data o enemácích


  //spawn default 
  
//player
console.log(playerClasses);
spawnEntity({
  x: playerX, y: playerY,
  scale: 5,
  width: 14, height: 15,
  tags: playerClasses,//['playerBasic','shadow','shooter', 'onDieRemove','targeting','healthBar','regenerates'],
  extraClasses: ['player'],
  statsConfig: { isEnemy: false, type: 'player', health: playerHealth , maxHealth:playerMaxHealth , attackDamage: playerAtk, },
  animConfig: {
    sheet: 'tower',
    defaultAnimation: 'walking',
    animations: {
      walking: { startX: 0, startY: 0, frameWidth: 14, frameHeight: 15, frameCount: 2, fps: 2, loop: true },
      dead:    { startX: 28  , startY: 0, frameWidth: 14, frameHeight: 15, frameCount: 1, fps: 0.5, loop: false }
    },
  }
});

//base
spawnEntity({
  x: 40, y: 40,
  scale: 5,
  width: 28, height: 28,
  tags: baseClasses,//['shadow','targeting','regenerates','baseBasic'],
  extraClasses: ['mainBase'],
  statsConfig: { isEnemy: false, type: 'Main_base', health: baseHealth, attackDamage: baseAtk, },
  animConfig: {
    sheet: 'main',
    defaultAnimation: 'standing',
    animations: {
      standing : { startX: 0, startY: 0, frameWidth: 28, frameHeight: 28, frameCount: 1, fps: 1, loop: true }
    },
  }
});


}

getDataOfGame("filip","mojeHeslo123");




// ─── Mobile Detection ─────────────────────────────────────────────────────────
const isMobile = () => window.matchMedia('(max-width: 768px)').matches 
                    || ('ontouchstart' in window);

// ─── Landscape Lock Overlay (CSS injection) ───────────────────────────────────
(function injectLandscapeLock() {
  const style = document.createElement('style');
  style.textContent = `
    #portrait-overlay {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: #0a0a0a;
      color: #fff;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: sans-serif;
      font-size: 1.2rem;
      gap: 16px;
      text-align: center;
    }
    #portrait-overlay svg {
      width: 64px; height: 64px;
      animation: rotateHint 1.5s ease-in-out infinite alternate;
    }
    @keyframes rotateHint {
      from { transform: rotate(0deg); }
      to   { transform: rotate(90deg); }
    }
    @media (max-width: 768px) and (orientation: portrait) {
      #portrait-overlay { display: flex; }
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'portrait-overlay';
  overlay.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="5" y="2" width="14" height="20" rx="2"/>
      <circle cx="12" cy="18" r="1"/>
    </svg>
    <span>Otočte telefon na šířku</span>
    <small style="opacity:.5">Hra vyžaduje landscape režim</small>
  `;
  document.body.appendChild(overlay);
})();


// ─── Touch Movement ────────────────────────────────────────────────────────────
(function initTouchControls() {
  let touchStartX = 0;
  let touchStartY = 0;
  let lastTouchX = 0;
  let lastTouchY = 0;
  let isSwiping = false;
  const SWIPE_THRESHOLD = 5;

  document.addEventListener('touchstart', (e) => {
    // Ignoruj UI elementy
    if (e.target.closest('.ui')) return;

    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
    lastTouchX  = t.clientX;
    lastTouchY  = t.clientY;
    isSwiping   = false;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.ui')) return;
    if (window._gamePaused) return; // ← blokuj pohyb při pause

    const t = e.touches[0];
    const dx = t.clientX - lastTouchX;
    const dy = t.clientY - lastTouchY;

    // Pokud jsme se pohnuli víc než práh → je to swipe
    if (Math.abs(t.clientX - touchStartX) > SWIPE_THRESHOLD ||
        Math.abs(t.clientY - touchStartY) > SWIPE_THRESHOLD) {
      isSwiping = true;
    }

    if (isSwiping) {
      // Pohyb kamery (opačný směr než prst — jako mapa)
      worldX -= dx;
      worldY -= dy;
      updateAll();
    }

    lastTouchX = t.clientX;
    lastTouchY = t.clientY;

    e.preventDefault(); // zabraň scrollování stránky
  }, { passive: false });

  document.addEventListener('touchend', (e) => {
    if (e.target.closest('.ui')) return;
    if (window._gamePaused) return; // ← blokuj skill při pause

    // Krátký tap (ne swipe) = použij skill
    if (!isSwiping) {
      const t = e.changedTouches[0];
      const syntheticEvent = {
        clientX: t.clientX,
        clientY: t.clientY,
        target:  t.target,
      };
      if (skills[ruka]) {
        skills[ruka](syntheticEvent);
      }
    }

    isSwiping = false;
  }, { passive: true });
})();
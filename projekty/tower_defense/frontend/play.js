// ─── Stav ────────────────────────────────────────────────────────────────────
let worldX = 0, worldY = 0;       // offset kamery (kolik jsme posunuli pohled)
let playerX = 0, playerY = 0;     // pozice hráče ve světových souřadnicích
const SPEED = 8;
const keysDown = {};
const towerBar = document.getElementById('towerBar');
const heroBar = document.getElementById('heroFrame');


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
    let dx = 0, dy = 0;
    if (keysDown['w'] || keysDown['arrowup'])    dy -= SPEED;
    if (keysDown['s'] || keysDown['arrowdown'])  dy += SPEED;
    if (keysDown['a'] || keysDown['arrowleft'])  dx -= SPEED;
    if (keysDown['d'] || keysDown['arrowright']) dx += SPEED;

    if (dx !== 0 || dy !== 0) {
      worldX += dx;
      worldY += dy;
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
  actSki.firstChild.src='/projekty/tower_defense/frontend/img/SelectSkillImg/' + name + '.png';
  
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
      const response = await fetch(`http://localhost:3000/api/tower-type/${name}`);

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
    const response = await fetch("http://localhost:3000/api/base/get-data", {
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
const SHEETS = {
  enemy: './img/sheets/enemy_sheet.png',
  tower: './img/sheets/player_sheet.png',
  deco:  './img/sheets/deco.png',
  main:  './img/sheets/main_base.png'
};

// ─── Stats ────────────────────────────────────────────────────────────────────
class Stats {
  constructor({ element, isEnemy = false, type = 'unknown',
                health = 100, maxHealth = -1,
                attackDamage = 10, level = 1,
                x = 0, y = 0 }) {
    this.element      = element;
    this.isEnemy      = isEnemy;
    this.type         = type;
    this.health       = health;
    this.maxHealth    = (maxHealth == -1) ? health : maxHealth;
    this.attackDamage = attackDamage;
    this.level        = level;
    this.x            = x;
    this.y            = y;
    this.alive        = true;
    this.targetX      = null; 
    this.targetY      = null;
  }

  move(dx, dy) {
    this.x += dx;
    this.y += dy;
    this._syncPosition();
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;
    this._syncPosition();
  }

  _syncPosition() {
    this.element.dataset.ox = this.x;
    this.element.dataset.oy = this.y;
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) this.die();
  }

  heal(amount) {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  die() {
    if (!this.alive) return;
    this.alive = false;

    if (window._gameEntities) {
      window._gameEntities = window._gameEntities.filter(e => e.element !== this.element);
    }
    this.element.dispatchEvent(new CustomEvent('entity:die', { bubbles: true }));
    
  }
}


// ─── AnimationHandler ─────────────────────────────────────────────────────────
//
//  Každá animace je objekt:
//  {
//    startX:     px souřadnice levého okraje prvního framu na sheetu
//    startY:     px souřadnice horního okraje prvního framu na sheetu
//    frameWidth: šířka jednoho framu v px
//    frameHeight:výška jednoho framu v px
//    frameCount: počet framů
//    fps:        rychlost přehrávání
//    loop:       true / false
//  }
//
//  scale zvětší výsledný element i background-position.
// ─────────────────────────────────────────────────────────────────────────────
class AnimationHandler {
  constructor({ element, animations = {}, defaultAnimation = null, sheet = null, scale = 1 }) {
    this.element         = element;
    this.animations      = animations;
    this.scale           = scale;
    this.currentAnim     = null;
    this._frame          = 0;
    this._timer          = null;
    this._onEndCallback  = null;

    if (sheet) {
  const src = SHEETS[sheet] ?? sheet;
  element.style.backgroundImage  = `url('${src}')`;
  element.style.imageRendering   = 'pixelated';
  element.style.backgroundRepeat = 'no-repeat';
  // načti skutečnou velikost a aplikuj scale
  const img = new Image();
  img.onload = () => {
    element.style.backgroundSize = `${img.naturalWidth * scale}px ${img.naturalHeight * scale}px`;
  };
  img.src = SHEETS[sheet] ?? sheet;
}

    if (defaultAnimation) this.play(defaultAnimation);
  }

  play(name, onEnd = null) {
    if (this.currentAnim === name) return;
    const anim = this.animations[name];
    if (!anim) { console.warn(`Animation "${name}" not found.`); return; }

    this.stop();
    this.currentAnim    = name;
    this._frame         = 0;
    this._onEndCallback = onEnd;

    this._applyFrame(anim);

    this._timer = setInterval(() => {
      this._frame++;
      if (this._frame >= anim.frameCount) {
        if (anim.loop) {
          this._frame = 0;
        } else {
          this._frame = anim.frameCount - 1;
          this.stop();
          if (this._onEndCallback) this._onEndCallback();
          return;
        }
      }
      this._applyFrame(anim);
    }, 1000 / anim.fps);
  }

  stop() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    this.currentAnim = null;
  }

  freeze(animName, frameIndex = 0) {
    this.stop();
    const anim = this.animations[animName];
    if (!anim) return;
    this.currentAnim = animName;
    this._frame      = frameIndex;
    this._applyFrame(anim);
  }
  animDuration(name) {
    const anim = this.animations[name];
    if (!anim) return null;
    return (anim.frameCount / anim.fps) * 1000;
  }

  _applyFrame(anim) {
  const sheetX = anim.startX + this._frame * anim.frameWidth;
  const sheetY = anim.startY;
  this.element.style.backgroundPosition = `${-sheetX * this.scale}px ${-sheetY * this.scale}px`;
  }
}


// ─── BehaviorHandler ──────────────────────────────────────────────────────────
class BehaviorHandler {
  constructor({ element, stats, anim = null }) {
    this.element = element;
    this.stats   = stats;
    this.anim    = anim;
    this._tickId = null;

    element.addEventListener('entity:die', () => {
      this._runTag('onDie');
      this.stopTick();
    });
  }

  startTick(fps = 30) {
    this.stopTick();
    this._tickId = setInterval(() => this.tick(), 1000 / fps);
  }

  stopTick() {
    if (this._tickId) { clearInterval(this._tickId); this._tickId = null; }
  }

  tick() {
    this.element.classList.forEach(tag => {
      const fn = BehaviorHandler.tags[tag]?.tick;
      if (fn) fn(this);
    });
  }

  _runTag(hook) {
    this.element.classList.forEach(tag => {
      const fn = BehaviorHandler.tags[tag]?.[hook];
      if (fn) fn(this);
    });
  }

  onSpawn()  { this._runTag('onSpawn');  }
  onAttack() { this._runTag('onAttack'); }
}

BehaviorHandler.tags = {};

// ─── findNearestOpponent ──────────────────────────────────────────────────────
// Pomocná funkce — vrátí nejbližší živou entitu s opačným isEnemy
function findNearestOpponent(bh) {
  let nearest = null, bestDist = Infinity;
  (window._gameEntities ?? []).forEach(e => {
    if (!e.stats || !e.stats.alive) return;
    if (e.element.classList.contains('untouchable')) return;
    if (e.stats.isEnemy === bh.stats.isEnemy) return;
    if (e.element === bh.element) return;
    const d = Math.hypot(e.stats.x - bh.stats.x, e.stats.y - bh.stats.y);
    if (d < bestDist) { bestDist = d; nearest = e; }
  });
  return nearest ? { entity: nearest, dist: bestDist } : null;
}
 
 
// ─── targeting ────────────────────────────────────────────────────────────────
// Jednou za 100 ticků najde nejbližšího opačného nepřítele a uloží
// jeho souřadnice do stats.targetX / stats.targetY
BehaviorHandler.tags['targeting'] = {
  onSpawn: (bh) => {
    bh._targetTimer = 0;
  },
  tick: (bh) => {
    bh._targetTimer++;
    if (bh._targetTimer < 40+Math.floor(Math.random() * 40)) return;
    bh._targetTimer = 0;
 
    const result = findNearestOpponent(bh);
    if (result) {
      bh.stats.targetX = result.entity.stats.x;
      bh.stats.targetY = result.entity.stats.y;
    }
  },
};

// ─── Walk tagy ────────────────────────────────────────────────────────────────
// Všechny walk tagy jdou na stats.targetX/targetY pokud jsou nastavené,
// jinak fallback na playerX/playerY (pro enemy) nebo zůstanou stát.
 
function _walkTick(bh, speed) {
  // cíl: stats.target pokud existuje, jinak playerX/playerY pro enemy
  let tx = bh.stats.targetX;
  let ty = bh.stats.targetY;
  if (tx === null || tx === undefined) { return;
  }
 
  const dx   = tx - bh.stats.x;
  const dy   = ty - bh.stats.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 40) {
    bh.stats.move((dx / dist) * speed, (dy / dist) * speed);
    bh.element.dataset.flip = dx > 0 ? '-1' : '1';
  }
}
 
BehaviorHandler.tags['slowWalk'] = {
  onSpawn: (bh) => { bh.anim?.play('walking'); },
  tick:    (bh) => { _walkTick(bh, 1); },
};
 
BehaviorHandler.tags['normalWalk'] = {
  onSpawn: (bh) => { bh.anim?.play('walking'); },
  tick:    (bh) => { _walkTick(bh, 2); },
};
 
BehaviorHandler.tags['fastWalk'] = {
  onSpawn: (bh) => { bh.anim?.play('walking'); },
  tick:    (bh) => { _walkTick(bh, 3); },
};
 
BehaviorHandler.tags['speeder'] = {
  onSpawn: (bh) => { bh.anim?.play('walking'); },
  tick:    (bh) => { _walkTick(bh, 5); },
};
BehaviorHandler.tags['shadow'] = {
  onSpawn: (bh) => {
    bh.element.style.filter = 'drop-shadow(0 8px 4px rgba(0,0,0,0.3))';
  },
};

BehaviorHandler.tags['regenerates'] = {
  tick: (bh) => {
    bh._regenTimer = (bh._regenTimer ?? 0) + 1;
    if (bh._regenTimer >= 60) { bh._regenTimer = 0; bh.stats.heal(5); }
  },
};

BehaviorHandler.tags['onDieRemove'] = {
  onDie: (bh) => {
    bh.anim?.play('dead', () => bh.element.remove());
    if (!bh.anim) setTimeout(() => bh.element.remove(), 1500);
  },
};

BehaviorHandler.tags['playerBasic'] = {
  onSpawn: (bh) => {
    window._playerEntity = bh;
  },

  tick: (bh) => {
    playerX = bh.stats.x;
    playerY = bh.stats.y;
  },  
};

BehaviorHandler.tags['baseBasic'] = {
  onSpawn: (bh) => {
    window._mainBaseEntity = bh;

    // Initialize UI from stats on spawn
    baseMaxHealth = bh.stats.maxHealth;
    baseHealth = bh.stats.health;
    healthText.innerHTML = "health: " + baseHealth;
  },

  tick: (bh) => {
    // Keep local vars in sync with actual stats
    if (bh.stats.health !== baseHealth) {
      baseHealth = bh.stats.health;
      baseMaxHealth = bh.stats.maxHealth;
      updateBaseHealth(0);

      if (baseHealth <= 0) { GameOver(); }
    }
  },
};

// ─── Projectile ───────────────────────────────────────────────────────────────
// Parametry které musí být nastaveny na stats před spawnnutím:
//   stats.vx, stats.vy   — směr a rychlost (world px / tick)
//   stats.isEnemy        — zdědí od střelce
//   stats.attackDamage   — zdědí od střelce

BehaviorHandler.tags['projectile'] = {
  onSpawn: (bh) => {
    const anim = bh.stats.isEnemy ? 'enemyPro' : 'playerPro';
    bh.anim?.play(anim);

    bh._lifetime = 0;
    bh._maxLifetime = 220;
  },

  tick: (bh) => {
    // životnost
    bh._lifetime++;
    if (bh._lifetime >= bh._maxLifetime) {
      bh.stats.die();
      return;
    }

    // pohyb
    bh.stats.move(bh.stats.vx, bh.stats.vy);
    bh.element.dataset.flip = bh.stats.vx >= 0 ? '1' : '-1';

    // hledej kolizi se všemi .in-game elementy
    const all = document.querySelectorAll('.in-game');
    for (const el of all) {
      if (el === bh.element) continue;
      if (el.classList.contains('untouchable')) continue;

      // najdi entitu podle elementu — musí mít stats s opačným isEnemy
      const target = window._gameEntities?.find(e => e.element === el);
      if (!target?.stats) continue;
      if (target.stats.isEnemy === bh.stats.isEnemy) continue;

      // jednoduchá AABB kolize
      const a = bh.element.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      const hit = a.left < b.right && a.right > b.left &&
                  a.top  < b.bottom && a.bottom > b.top;

      if (hit) {
        target.stats.takeDamage(bh.stats.attackDamage);
        bh.stats.die();   // projectil zemře
        return;
      }
    }
  },

  onDie: (bh) => {
    bh.element.remove();
  },
};


// ─── Shooter ──────────────────────────────────────────────────────────────────
BehaviorHandler.tags['shooter'] = {
  onSpawn: (bh) => {
    bh._shootTimer    = 0;
    bh._shootCooldown = 60 + Math.floor(Math.random() * 60);
    bh._isShooting    = false; 
  },
 
  tick: (bh) => {
    if (bh._isShooting) return;  // čekej na konec animace
 
    bh._shootTimer++;
    if (bh._shootTimer < bh._shootCooldown) return;
 
    // cíl — stats.target pokud existuje, jinak hledej nejbližšího
    let tx = bh.stats.targetX;
    let ty = bh.stats.targetY;
    if (tx === null || tx === undefined) {
      const result = findNearestOpponent(bh);
      if (!result) return;
      tx = result.entity.stats.x;
      ty = result.entity.stats.y;
    }
 
    const dx   = tx - bh.stats.x;
    const dy   = ty - bh.stats.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;
 
    const speed = 5;
    const vx    = (dx / dist) * speed;
    const vy    = (dy / dist) * speed;
 
    // spusť animaci a vystřel AŽ po jejím skončení
    if (bh.anim?.animations['shooting']) {
      bh._isShooting = true;
      bh.anim.play('shooting', () => {
        bh._isShooting = false;
        bh.anim?.play('walking');
        _doShoot(bh, vx, vy);
      });
    } else {
      // žádná shooting animace — vystřel okamžitě
      _doShoot(bh, vx, vy);
    }
 
    bh._shootTimer    = 0;
    bh._shootCooldown = 35;
  },
};
 
function _doShoot(bh, vx, vy) {
  const proj = spawnEntity({
    x: bh.stats.x,
    y: bh.stats.y,
    width: 5, height: 3,
    scale: 5,
    tags: ['projectile','untouchable'],
    statsConfig: {
      isEnemy:      bh.stats.isEnemy,
      attackDamage: bh.stats.attackDamage,
      type:         'projectile',
      health:       1,
    },
    animConfig: {
      sheet: bh.stats.isEnemy ? 'enemy' : 'tower',
      defaultAnimation: bh.stats.isEnemy ? 'enemyPro' : 'playerPro',
      animations: {
        enemyPro:  { startX: 0,  startY: 0,  frameWidth: 6, frameHeight: 6, frameCount: 1, fps: 1,   loop: true },
        playerPro: { startX: 0,  startY: 15, frameWidth: 5, frameHeight: 3, frameCount: 1, fps: 0.1, loop: true },
      },
    },
    tickFps: 60,
  });
 
  proj.stats.vx = vx;
  proj.stats.vy = vy;
}

// ─── Puncher ──────────────────────────────────────────────────────────────────
// Tagy:
//   'puncher'                    — základní melee behaviour
//   'fastPuncher'                — cooldown 30 ticků  (~1s při 30fps)
//   'mediumPuncher'              — cooldown 60 ticků  (~2s)
//   (žádný druhý tag)            — cooldown 90 ticků  (~3s)
//
// Dosah útoku: 40px (world souřadnice)
// Dosah aktivace cooldownu: 80px

// ─── Puncher ──────────────────────────────────────────────────────────────────
const PUNCH_RANGE       = 75;
const PUNCH_AGGRO_RANGE = 120;
 
BehaviorHandler.tags['puncher'] = {
  onSpawn: (bh) => {
    bh._punchTimer   = 0;
    bh._isPunching   = false;  // blokuje útok dokud animace nedoběhne
 
    if (bh.element.classList.contains('fastPuncher')) {
      bh._punchCooldown = 30;
    } else if (bh.element.classList.contains('mediumPuncher')) {
      bh._punchCooldown = 60;
    } else {
      bh._punchCooldown = 90;
    }
  },
 
  tick: (bh) => {
    if (bh._isPunching) return;  // čekej na konec animace
 
    // cíl — stats.target pokud existuje, jinak hledej nejbližšího
    let nearestEntity = null;
    let bestDist      = Infinity;
 
    if (bh.stats.targetX !== null && bh.stats.targetX !== undefined) {
      // najdi entitu na cílových souřadnicích
      const result = findNearestOpponent(bh);
      if (result) { nearestEntity = result.entity; bestDist = result.dist; }
    } else {
      const result = findNearestOpponent(bh);
      if (result) { nearestEntity = result.entity; bestDist = result.dist; }
    }
 
    if (!nearestEntity) return;
 
    if (bestDist <= PUNCH_AGGRO_RANGE) {
      bh._punchTimer++;
    }
 
    if (bh._punchTimer >= bh._punchCooldown) {
      bh._punchTimer = 0;
 
      if (bestDist <= PUNCH_RANGE) {
        // spusť animaci a zasáhni AŽ po jejím skončení
        if (bh.anim?.animations['punch']) {
          bh._isPunching = true;
          bh.anim.play('punch', () => {
            bh._isPunching = false;
            nearestEntity.stats.takeDamage(bh.stats.attackDamage);
            bh.anim?.play('walking');
          });
        } else {
          nearestEntity.stats.takeDamage(bh.stats.attackDamage);
        }
      }
    }
  },
};
 

BehaviorHandler.tags['healthBar'] = {
  onSpawn: (bh) => {
    const BAR_W  = 48;
    const BAR_H  = 20;
    const OFFSET = 44; // px nad entitou ve world space

    // fill
    const fill = document.createElement('div');
    fill.classList.add('in-game', 'entity-health-fill');
    fill.classList.add(bh.stats.isEnemy ? 'enemy' : 'ally');
    fill.style.width  = BAR_W + 'px';
    fill.style.height = (BAR_H - 2) + 'px';
    fill.style.zIndex = '99';
    fill.style.pointerEvents = 'none';
    fill.dataset.ox = bh.stats.x;
    fill.dataset.oy = bh.stats.y - OFFSET;
    document.body.appendChild(fill);
    bh._hpFill = fill;

    // frame
    const frame = document.createElement('div');
    frame.classList.add('in-game', 'entity-health-bar');
    frame.style.zIndex = '100';
    frame.style.pointerEvents = 'none';
    frame.dataset.ox = bh.stats.x;
    frame.dataset.oy = bh.stats.y - OFFSET;
    document.body.appendChild(frame);
    bh._hpFrame = frame;

    bh._hpOffset = OFFSET;

    bh.element.addEventListener('entity:die', () => {
      bh._hpFill?.remove();
      bh._hpFrame?.remove();
    });
  },

  tick: (bh) => {
    if (!bh._hpFill || !bh._hpFrame) return;

    // sleduj pozici entity — updateAll() udělá zbytek
    bh._hpFill.dataset.ox  = bh.stats.x;
    bh._hpFill.dataset.oy  = bh.stats.y - bh._hpOffset;
    bh._hpFrame.dataset.ox = bh.stats.x;
    bh._hpFrame.dataset.oy = bh.stats.y - bh._hpOffset;

    // šířka podle hp
    const pct = Math.max(0, bh.stats.health / bh.stats.maxHealth);
    bh._hpFill.style.width = (48 * pct) + 'px';
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  spawnEntity
//
//  width / height  — velikost jednoho framu na sheetu v px
//  scale           — kolikrát zvětšit (default 1)
//                    element na obrazovce bude width*scale × height*scale px
// ═══════════════════════════════════════════════════════════════════════════════
function spawnEntity({
  x = 0, y = 0,
  scale = 1,
  tags = [],
  statsConfig  = null,
  animConfig   = null,
  tickFps      = 30,
  startTick    = true,
  extraClasses = [],
  width        = 16,
  height       = 16,
  imgSrc       = null,
}) {
  const el = imgSrc ? document.createElement('img') : document.createElement('div');
  if (imgSrc) el.src = imgSrc;

  el.classList.add('in-game', ...tags, ...extraClasses);

  Object.assign(el.style, {
    position:       'fixed',
    left:           '0',
    top:            '0',
    width:          (width  * scale) + 'px',   // element je zvětšený
    height:         (height * scale) + 'px',
    pointerEvents:  'none',
    imageRendering: 'pixelated',
  });

  el.dataset.ox = x;
  el.dataset.oy = y;

  document.body.appendChild(el);

  const stats = statsConfig
    ? new Stats({ element: el, x, y, ...statsConfig })
    : null;

  const anim = animConfig
    ? new AnimationHandler({ element: el, scale, ...animConfig })
    : null;

  // backgroundSize musí odpovídat scale — nastavíme po vytvoření AnimationHandler
  // aby přepsal případné 'auto' z AnimationHandler
  if (anim && scale !== 1) {
  const img = new Image();
  img.onload = () => {
    el.style.backgroundSize = `${img.naturalWidth * scale}px ${img.naturalHeight * scale}px`;
  };

  const raw = el.style.backgroundImage;
  img.src = raw.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
}

  const behavior = (stats || tags.length)
    ? new BehaviorHandler({ element: el, stats, anim })
    : null;

  if (behavior) {
    behavior.onSpawn();
    if (startTick) behavior.startTick(tickFps);
  }
  window._gameEntities = window._gameEntities ?? [];
  window._gameEntities.push({ element: el, stats, anim, behavior });

  return { element: el, stats, anim, behavior };
  return { element: el, stats, anim, behavior };
}




//spikes
PlaceSpikes(80,80);
function PlaceSpikes(x,y){

spawnEntity({
  x: x, y: y,
  scale: 5,
  width: 14, height: 15,
  tags: ['puncher','fastpuncher' ,'onDieRemove','targeting','healthBar','untouchable'],
  extraClasses: ['player'],
  statsConfig: { isEnemy: false, type: 'Ninja', health: 50, attackDamage: 3, },
  animConfig: {
    sheet: 'tower',
    defaultAnimation: 'walking',
    animations: {
      walking: { startX: 0, startY: 19, frameWidth: 14, frameHeight: 15, frameCount: 1, fps: 2, loop: true },
      punch:   { startX: 0, startY: 19, frameWidth: 14, frameHeight: 15, frameCount: 3, fps: 4, loop: false},
      dead:    { startX: 42, startY: 19, frameWidth: 14, frameHeight: 15, frameCount: 1, fps: 0.5, loop: false }
    },
  }
});
}
//basicNinja

PlaceBasicNinja(80,0)
function PlaceBasicNinja(x,y){
spawnEntity({
  x: x, y: y,
  scale: 5,
  width: 14, height: 14,
  tags: ['shooter', 'onDieRemove','targeting','healthBar'],
  extraClasses: ['player'],
  statsConfig: { isEnemy: false, type: 'Ninja', health: 20, attackDamage: 1, },
  animConfig: {
    sheet: 'tower',
    defaultAnimation: 'walking',
    animations: {
      walking: { startX: 0, startY: 33, frameWidth: 14, frameHeight: 14, frameCount: 1, fps: 2, loop: true },
      shooting:{ startX: 0, startY: 33, frameWidth: 14, frameHeight: 14, frameCount: 3, fps: 4, loop: false},
      dead:    { startX: 42, startY: 33, frameWidth: 14, frameHeight: 14, frameCount: 1, fps: 0.5, loop: false }
    },
  }
});

}

//blob
SummonBlob(1000,1000,1);
SummonBlob(2000,1000,1);
SummonBlob(3000,1000,1);
SummonBlob(4000,1000,1);
SummonBlob(5000,1000,1);
function SummonBlob(x,y,level){

  spawnEntity({
  x: x, y: y,
  scale: 8,
  width: 9, height: 8,
  level:level,
  tags: ['speeder', 'onDieRemove','shadow','puncher','targeting','healthBar'],
  statsConfig: { isEnemy: true, type: 'blob', health: 100, attackDamage: 30, },
  animConfig: {
    sheet: 'enemy',
    defaultAnimation: 'walking',
    animations: {
      walking: { startX: 0, startY: 0, frameWidth: 9, frameHeight: 6, frameCount: 3, fps: 4, loop: true },
      punch:   { startX: 36, startY: 0, frameWidth: 9, frameHeight: 6, frameCount: 2, fps: 4, loop: false},
      dead:    { startX: 27  , startY: 0, frameWidth: 9, frameHeight: 6, frameCount: 1, fps: 0.5, loop: false }
    },
  },
});
}






// ═══════════════════════════════════════════════════════════════════════════════
//  SPAWN EXAMPLES  —  delete these, they show the pattern
// ═══════════════════════════════════════════════════════════════════════════════

/*

// ── Simple grass / decoration (no stats, no behavior) ─────────────────────────
spawnEntity({
  x: 200, y: -100,
  tags: [],
  imgSrc: './img/dopln/trava.png',
  width: 20, height: 14,
});


// ── Basic enemy that slowly walks toward the player ───────────────────────────
spawnEntity({
  x: 400, y: 200,
  tags: ['slowWalk', 'onDieRemove'],
  statsConfig: {
    isEnemy: true,
    type: 'goblin',
    health: 60, maxHealth: 60,
    attackDamage: 8,
  },
  animConfig: {
    defaultAnimation: 'walking',
    animations: {
      walking: { frameWidth: 48, frameHeight: 48, startCol: 0, startRow: 0, frameCount: 6, fps: 10, loop: true  },
      dead:    { frameWidth: 48, frameHeight: 48, startCol: 0, startRow: 3, frameCount: 4, fps: 8,  loop: false },
    },
  },
  width: 48, height: 48,
});


// ── Fast flying shooter that prefers towers ───────────────────────────────────
spawnEntity({
  x: -300, y: 100,
  tags: ['fastWalk', 'flying', 'shoots', 'preferTowerTarget', 'onDieRemove'],
  statsConfig: {
    isEnemy: true,
    type: 'wyvern',
    health: 120, maxHealth: 120,
    attackDamage: 20,
    level: 3,
  },
  animConfig: {
    defaultAnimation: 'walking',
    animations: {
      walking:  { frameWidth: 64, frameHeight: 64, startCol: 0, startRow: 0, frameCount: 8, fps: 12, loop: true  },
      shooting: { frameWidth: 64, frameHeight: 64, startCol: 0, startRow: 1, frameCount: 4, fps: 10, loop: false },
      dead:     { frameWidth: 64, frameHeight: 64, startCol: 0, startRow: 2, frameCount: 5, fps: 8,  loop: false },
    },
  },
  width: 64, height: 64,
});


// ── Tower (no movement, just sits there) ─────────────────────────────────────
const tower = spawnEntity({
  x: 0, y: -200,
  tags: ['shoots'],
  statsConfig: {
    isEnemy: false,
    type: 'tower',
    health: 300, maxHealth: 300,
    attackDamage: 25,
  },
  width: 64, height: 96,
});

// Register so enemies with 'preferTowerTarget' can find it
window._gameTowers = window._gameTowers ?? [];
window._gameTowers.push(tower);

*/
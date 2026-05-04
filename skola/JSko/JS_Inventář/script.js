/**
 * ZADÁNÍ: RPG INVENTÁŘ
 * Tvým úkolem je oživit HTML a CSS šablonu pomocí JavaScriptu.
 * Postupuj podle kroků níže.
 */
let inv = document.getElementById('inventory-grid');
let itemDet= document.getElementById('item-details');
// Výchozí statistiky hráče
let playerStats = {
    gold: 0,
    baseAttack: 10,
    baseDefense: 5
};

// Aktuálně vybavené předměty (null znamená, že slot je prázdný)
let equippedItems = {
    weapon: null,
    armor: null
};

// Databáze předmětů (Pole objektů)
let items = [
    { id: 1, name: "Železný meč", type: "weapon", attack: 15, defense: 0, price: 50 },
    { id: 2, name: "Dřevěný štít", type: "armor", attack: 0, defense: 10, price: 30 },
    { id: 3, name: "Ocelová zbroj", type: "armor", attack: 0, defense: 25, price: 100 },
    { id: 4, name: "Kouzelná hůl", type: "weapon", attack: 25, defense: 2, price: 150 },
    { id: 5, name: "Starý hadr", type: "trash", attack: 0, defense: 1, price: 1 }
];

// Globální proměnné pro Timer a Drag&Drop
let merchantTimer = null;
let countdownInterval = null;
let draggedItemData = null; // Zde si uložíme ID předmětu, který zrovna táhneme
let itemInMerchant = null; // Předmět aktuálně nabídnutý obchodníkovi

/**
 * ÚKOL 1: Vykreslení inventáře (DOM)
 * Napiš funkci `renderInventory()`, která projde pole `items` a pro každý objekt
 * vytvoří `div` s třídou `item`.
 * - Nastav elementu atribut `draggable="true"`.
 * - Ulož do něj ID předmětu.
 * - Vlož dovnitř elementu jméno předmětu.
 * - Elementy připoj do `<div id="inventory-grid">`.
 * - Před vykreslením nezapomeň kontejner vyprázdnit.
 */
renderInventory();
function renderInventory(){
    inv.innerHTML = "";
    
    for(let item of items){
        let div = document.createElement('div');
        div.dataset.id = item.id;
        div.draggable=true;
        div.innerHTML=item.name;
        div.classList.add('item');
        div.addEventListener('mouseenter',() =>detail(item));
        div.addEventListener('mouseleave',detailBack);
        inv.appendChild(div);
    }
}

/**
 * ÚKOL 2: Detaily předmětu
 * Při najetí myší na vytvořený předmět najdi podle ID data v poli `items`.
 * Vypiš do `<div id="item-details">` jeho název, typ, útok, obranu a cenu.
 * Při odjetí myši vrať text "Najeďte myší na předmět...".
 */
function detail(item){
    itemDet.innerHTML=
    "Jmeno : " + item.name + 
    "           Typ : " + item.type +
    "           útok : " + item.attack +
    "           obrana : " + item.defense +
    "           cena : " + item.prize;
}
function detailBack(){
    itemDet.innerHTML="Najeďte myší na předmět...";
}

/**
 * ÚKOL 3: Vybavování předmětů
 * Po kliknutí na předmět v inventáři se stane následující:
 * 1. Zkontroluj `type` předmětu (pokud je to "trash", nedělej nic).
 * 2. Hráč může mít aktivní jen jednu zbraň ("weapon") a jednu zbroj ("armor").
 * 3. Pokud hráč už má zbraň/zbroj, musíš předchozí předmět "odvybavit" (odebrat mu třídu `active`).
 * 4. Ulož vybraný předmět do objektu `equippedItems` na správnou pozici.
 * 5. Přidej kliknutému HTML elementu třídu `active`.
 * 6. Pokud hráč klikne na už vybavený předmět, předmět se "odvybaví" (sundá se).
 * 7. Aktualizuj HTML - vypiš názvy vybavených věcí do `#slot-weapon` / `#slot-armor`.
 * 8. Přepočítej a vypiš celkové statistiky hráče (baseAttack + zbraň + zbroj atd.) do `#stat-attack` a `#stat-defense`.
 */

/**
 * ÚKOL 4: Drag & Drop - Základy (Events)
 * 1. Na každý `.item` pověs event `dragstart`. Ulož si ID taženého předmětu do proměnné `draggedItemData`.
 * 2. Všechny elementy s třídou `.dropzone` musí mít eventy `dragover` a `dragleave` (pro vizuální efekt přidání/odebrání třídy `drag-over`). V `dragover` nezapomeň na `event.preventDefault()`.
 * 3. Zpracuj event `drop` na dropzónách.
 */

/**
 * ÚKOL 5: Koš (Array manipulation, Drop)
 * Pokud je předmět puštěn (drop) do `<div id="trash-zone">`:
 * 1. Najdi předmět v poli `items` podle `draggedItemData` a odstraň ho (např. pomocí `filter` nebo `splice`).
 * 2. Pokud byl předmět vybavený, odvybav ho (uprav `equippedItems` a přepočítej staty).
 * 3. Zavolej znovu `renderInventory()`, aby předmět zmizel z obrazovky.
 */

/**
 * ÚKOL 6: Obchodník a Časovač (BOM - Timers, Drop)
 * Pokud je předmět puštěn do `<div id="merchant-zone">`:
 * 1. Zkontroluj, zda už u obchodníka nějaký předmět není (pokud ano, ignoruj nebo ten starý vrať).
 * 2. Zobraz div `#merchant-offer` (odeber mu třídu `hidden`).
 * 3. Vypiš cenu taženého předmětu do `#offer-price`. Ulož si předmět do `itemInMerchant`.
 * 4. Spusť odpočet 10 sekund (vizualizuj odpočet v `#offer-timer`).
 * 5. Z HTML (z inventáře) tento předmět dočasně skryj.
 * 6. POKUD VYPRŠÍ ČAS (10 sekund): 
 * - Skryj nabídku obchodníka.
 * - Předmět se "vrátí" do inventáře.
 * - Vynuluj časovače a proměnnou `itemInMerchant`.
 */

/**
 * ÚKOL 7: Prodej (Click, Timers clear)
 * Pokud hráč klikne na tlačítko `#btn-sell`:
 * 1. Zastav časovače!
 * 2. Přičti cenu `itemInMerchant` k `playerStats.gold` a aktualizuj DOM (`#stat-gold`).
 * 3. Skryj nabídku obchodníka.
 * 4. Úplně odstraň `itemInMerchant` z pole `items` (jako u koše). Pokud byl vybavený, zruš jeho efekt.
 * 5. Zavolej `renderInventory()`.
 */

// Zde začni psát svůj kód...
// (Nápověda: Na konci kódu nezapomeň rovnou zavolat renderInventory() pro první vykreslení)
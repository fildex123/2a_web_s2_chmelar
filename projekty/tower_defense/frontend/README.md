# 🥷 Ninja Tower
> Tower Defense webová hra | Školní projekt

---

## Popis projektu

Ninja Tower je browser-based tower defense hra s pixel art grafikou. Hráč brání svou Ninja základnu před vlnami nepřátel tím, že strategicky pokládá obranné věže (ninje). Hra klade důraz na trvalost — každý hráč má jen jednu základnu a po prohře začíná úplně od začátku.

Frontend je postaven čistě v HTML, CSS a vanilla JS bez frameworků. Backend běží na Node.js s Express a PostgreSQL databází.

---

## Technologie

### Frontend
- HTML5 / CSS3 / Vanilla JavaScript
- Pixel art grafika, tmavý vizuální styl
- Canvas-free herní engine — pozice entit přes CSS transform
- PWA (Progressive Web App) — přidatelná na plochu, funguje offline
- Mobilní podpora — swipe pro pohyb kamery, landscape lock
- Service Worker pro cachování assetů

### Backend
- Node.js + Express
- PostgreSQL databáze
- REST API pro správu hráčů, základen a věží
- bcrypt pro hashování hesel
- Nasazeno na Railway

---

## Herní mechaniky

### Základna a přežití
Každý hráč má právě jednu Ninja základnu. Základna přežívá mezi herními relacemi — data se ukládají po každé vlně nepřátel. Pokud hráč prohraje, jeho skóre se zapíše do globálního žebříčku a základna se vynuluje. Hra je navržena tak, aby byla hratelná donekonečna při správné strategii.

### Věže a nepřátelé
Hráč pokládá obranné věže kliknutím (nebo tapnutím na mobilu) na herní mapu. Každý typ věže má vlastní statistiky a animace uložené v databázi. Nepřátelé přicházejí ve vlnách — obtížnost roste lineárně. Některé vlny jsou generované algoritmem, jiné jsou ručně navržené custom vlny.

### Pohyb kamery
- **Desktop:** klávesy WASD nebo šipky
- **Mobil:** přetažení prstem (swipe)
- Telefon se automaticky vyzve k otočení do landscape režimu

---

## Databázová struktura

| Tabulka | Popis |
|---|---|
| `nt_users` | Uživatelské účty |
| `nt_user_base` | Data základny každého hráče |
| `nt_towers` | Položené věže v základně |
| `nt_tower_types` | Šablony věží se statistikami a animacemi |
| `nt_enemies` | Živí nepřátelé na mapě |
| `nt_en_typ` | Typy nepřátel a jejich vlastnosti |
| `nt_waves` | Custom vlny nepřátel |
| `nt_wave_enemies` | Vazební tabulka vln a typů nepřátel |
| `nt_lead` | Globální žebříček skóre |
| `nt_user_friends` | Přátelé mezi hráči |

---

## API endpointy

| Metoda | Endpoint | Popis |
|---|---|---|
| POST | `/api/auth/register` | Registrace nového hráče |
| POST | `/api/base/get-data` | Načtení dat základny |
| POST | `/api/base/create` | Vytvoření nové základny |
| GET | `/api/tower-type/:name` | Šablona věže podle názvu |

---

## Spuštění lokálně

### Požadavky
- Node.js
- PostgreSQL

### Backend
```bash
cd backend
npm install
node index.js
```

Nastav `.env` soubor:
```env
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=heslo
PGDATABASE=tower_defense_db
PGPORT=5432
```

### Frontend
Nahraj soubory na webhosting nebo otevři `index.html` lokálně. API URL v `play.js` nastav na adresu svého backendu.

---

*Filip Chmelař · 2024/2025*
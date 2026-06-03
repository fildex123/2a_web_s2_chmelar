const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt"); // <-- PŘIDÁNO: import pro šifrování hesel
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get("/api/test", (req, res) => {
  res.json({ msg: "Backend běží!" });
});


// --- KROK: REGISTRACE NOVÉHO UŽIVATELE ---
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body; // od front-endu čekáme jméno a heslo

  try {
    // 1. Zašifrujeme heslo, aby v DB nebylo čitelné
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Uložíme uživatele do naší nové tabulky (ukládáme hashedPassword!)
    const result = await pool.query(
      "INSERT INTO nt_users (username, password_hash) VALUES ($1, $2) RETURNING id, username",
      [username, hashedPassword]
    );
    
    // Vrátíme úspěch a data uživatele (bez hesla!)
    res.status(201).json({ msg: "Uživatel zaregistrován", user: result.rows[0] });

  } catch (err) {
    console.error(err);

    // Kód 23505 znamená v PostgreSQL, že porušujeme UNIQUE podmínku (jméno už existuje)
    if (err.code === "23505") {
      return res.status(400).json({ error: "Uživatelské jméno je již obsazené" });
    }

    res.status(500).json({ error: "Chyba serveru při registraci" });
  }
});

// --- KROK: ZÍSKÁNÍ DAT ZÁKLADNY POMOCÍ JMÉNA A HESLA ---
app.post("/api/base/get-data", async (req, res) => {
  const { username, password } = req.body; // čekáme přihlašovací údaje

  try {
    // 1. Najdeme uživatele v tabulce nt_users podle jména
    const userResult = await pool.query(
      "SELECT * FROM nt_users WHERE username = $1", 
      [username]
    );
    
    // Pokud uživatel neexistuje
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Nesprávné jméno nebo heslo" });
    }

    const user = userResult.rows[0];

    // 2. Ověříme, zda zadané heslo sedí s hashem v databázi
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Nesprávné jméno nebo heslo" });
    }

    // 3. Heslo je správné! Teď vytáhneme data z tabulky nt_user_base
    const baseResult = await pool.query(
      "SELECT * FROM nt_user_base WHERE user_id = $1",
      [user.id]
    );

    // Pokud uživatel ještě nemá vytvořenou základnu (tabulka je pro něj prázdná)
    if (baseResult.rows.length === 0) {
      return res.json({ msg: "Uživatel ověřen, ale nemá zatím žádnou základnu." });
    }

    // Vrátíme data základny
    res.json({
      msg: "Ověření úspěšné",
      baseData: baseResult.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru při načítání dat" });
  }
});




// --- KROK: VYTVOŘENÍ ZÁKLADNY (START NOVÉ HRY) ---
app.post("/api/base/create", async (req, res) => {
  const { username, password, base_classes, hero_classes } = req.body;

  try {
    // 1. Ověříme uživatele podle jména
    const userResult = await pool.query(
      "SELECT * FROM nt_users WHERE username = $1", 
      [username]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Nesprávné jméno nebo heslo" });
    }

    const user = userResult.rows[0];

    // 2. Ověříme heslo
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Nesprávné jméno nebo heslo" });
    }

    // 3. Zkontrolujeme, zda uživatel náhodou základnu už nemá
    const existingBase = await pool.query(
      "SELECT user_id FROM nt_user_base WHERE user_id = $1",
      [user.id]
    );

    if (existingBase.rows.length > 0) {
      return res.status(400).json({ error: "Tento uživatel již základnu má vytvořenou." });
    }

    // 4. OPRAVENÝ INSERT: Necháme na databázi, aby si dosadila defaultní pole sama
    const newBaseResult = await pool.query(
      "INSERT INTO nt_user_base (user_id) VALUES ($1) RETURNING *",
      [user.id]
    );

    res.status(201).json({
      msg: "Základna úspěšně vytvořena!",
      baseData: newBaseResult.rows[0]
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru při vytváření základny" });
  }
});

// --- KROK: ZÍSKÁNÍ ŠABLONY PODLE NÁZVU (ID) ---
app.get("/api/tower-type/:name", async (req, res) => {
  const towerName = req.params.name; // vezme jméno z URL (např. basicNinja)

  try {
    const result = await pool.query(
      "SELECT * FROM nt_tower_types WHERE name = $1",
      [towerName]
    );

    // Pokud takový typ v databázi neexistuje
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Typ '${towerName}' nebyl nalezen.` });
    }

    // Vrátíme nalezenou šablonu (PostgreSQL sám převede JSONB na JS objekty)
    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru při načítání šablony" });
  }
});

app.listen(3000, () => console.log("Server běží na http://localhost:3000"));
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get("/api/test", (req, res) => {
  res.json({ msg: "Backend běží!" });
});

// příklad: načtení všech uživatelů
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM nt_users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

// příklad: vložení uživatele
app.post("/api/users", async (req, res) => {
  const { username, password_hash } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO nt_users (username, password_hash) VALUES ($1, $2) RETURNING *",
      [username, password_hash]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chyba serveru" });
  }
});

app.listen(3000, () => console.log("Server běží na http://localhost:3000"));

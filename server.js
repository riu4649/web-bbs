'use strict';
require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json());

app.use(express.static(__dirname));

const port = process.env.PORT || 3000;

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE
});

(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      username TEXT,
      content TEXT,
      date TEXT
    )
  `);
  const result = await pool.query("SELECT NOW()");
  console.log(result.rows);
})();

/*db.exec(`
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  content TEXT,
  date TEXT
)
`);*/

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

app.listen(port, error => {
  if (error) {
    console.error(error);
  } else {
    console.info('listen: ', port);
  }
});

app.post("/posts", async (req, res) => {
  const { username, content, date } = req.body;
  await pool.query(
    "INSERT INTO posts (username, content, date) VALUES ($1, $2, $3)",
    [username, content, date]
  );
  console.log(username, content, date);
  res.send("ok");
});

app.get("/posts", async (req, res) => {
  const result = await pool.query("SELECT * FROM posts");
  res.json(result.rows);
});

app.delete("/posts/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM posts WHERE id = $1", [id]);
  res.send("ok");
});

app.put("/posts/:id", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  await pool.query(
    "UPDATE posts SET content = $1 WHERE id = $2",
    [content, id]
  );

  res.send("ok");
});
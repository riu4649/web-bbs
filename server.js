'use strict';
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

app.use(express.json());

app.use(express.static(__dirname));

const port = process.env.PORT || 3000;

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

(async () => {
  //await pool.query('DROP TABLE IF EXISTS posts');
  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      username TEXT,
      content TEXT,
      date TIMESTAMP
    )
  `);
  const result = await pool.query("SELECT NOW()");
  console.log(result.rows);
  } catch (error) {
    console.error("Database initialization error:", error);
  }
  
})();




app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

app.post("/posts", async (req, res) => {
  try {
    const { username, content } = req.body;
    const now = new Date();
    //const date = now.getFullYear() + "/" + (now.getMonth() + 1) + "/" + now.getDate() + " " + now.getHours() + ":" + now.getMinutes();
    if (!username || username.trim() === "" || !content || content.trim() === "") {
      res.status(400).send("ユーザー名と内容を入力してください。");
      return;
    }
    await pool.query(
      "INSERT INTO posts (username, content, date) VALUES ($1, $2, $3)",
      [username, content, now]
    );
    console.log(username, content, now);
    res.status(201).send("ok");
    } catch (error) {
      console.error(error);
      res.status(500).send("サーバーエラーが発生しました。");
  }
  
});

app.get("/posts", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM posts ORDER BY date DESC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("サーバーエラーが発生しました。");
  }

});

app.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM posts WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      res.status(404).send("投稿が見つかりません。");
    } else {
      res.status(200).send("ok");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

app.put("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content || content.trim() === "") {
      res.status(400).send("内容を入力してください。");
      return;
    }
    const result = await pool.query(
      "UPDATE posts SET content = $1 WHERE id = $2",
      [content, id]
    );
    if (result.rowCount === 0) {
      res.status(404).send("投稿が見つかりません。");
    } else {
      res.status(200).send("ok");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
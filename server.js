process.env.TZ = "Asia/Tokyo";

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
      thread_id INTEGER REFERENCES threads(id),
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

(async () => {
  //await pool.query('DROP TABLE IF EXISTS posts');
  try {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS threads (
      id SERIAL PRIMARY KEY,
      title TEXT,
      username TEXT,
      date TIMESTAMP,
      updated_at TIMESTAMP
    );
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
    const { thread_id, username, content } = req.body;
    const now = new Date();
    if (!thread_id || thread_id.trim() === "" || !username || username.trim() === "" || !content || content.trim() === "") {
      res.status(400).send("ユーザー名と内容を入力してください。");
      return;
    }
    await pool.query(
      "INSERT INTO posts (thread_id, username, content, date) VALUES ($1, $2, $3, $4)",
      [thread_id, username, content, now]
    );
    await pool.query(
      "UPDATE threads SET updated_at = $1 WHERE id = $2",
      [now, thread_id]
    );
    console.log(thread_id, username, content, now);
    res.status(201).send("ok");
  } catch (error) {
      console.error(error);
      res.status(500).send("サーバーエラーが発生しました。");
  }
  
});

app.post("/threads", async (req, res) => {
  try{
    const { title, username } = req.body;
    const now = new Date();
    if (!title || title.trim() === "" || !username || username.trim() === "") {
      res.status(400).send("タイトルとユーザー名を入力してください。");
      return;
    }
    await pool.query(
      "INSERT INTO threads (title, username, date, updated_at) VALUES ($1, $2, $3, $4)",
      [title, username, now, now]
    );
    res.status(201).send("ok");
  } catch (error) {
    console.error(error);
    res.status(500).send("サーバーエラーが発生しました。")
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

app.get("/threads", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM threads ORDER BY updated_at DESC");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("サーバーエラーが発生しました。");
  }

});

app.get("/thread/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM threads WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      res.status(404).send("スレッドが見つかりません。")
    } else {
      res.status(200).json(result.rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("サーバーエラーが発生しました。")
  }
})

app.get("/thread/:id/posts", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM posts WHERE thread_id = $1 ORDER BY date ASC", [id])
    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("サーバーエラーが発生しました。")
  }
})

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

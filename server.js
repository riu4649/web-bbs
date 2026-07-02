'use strict';
const express = require("express");
const app = express();

app.use(express.json());

app.use(express.static(__dirname));

const port = 3000;

const Database = require("better-sqlite3");
const db = new Database("database.db");

db.exec(`
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT,
  content TEXT,
  date TEXT
)
`);

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

app.post("/posts", (req, res) => {
  const { username, content, date } = req.body;
  const stmt = db.prepare(
    "INSERT INTO posts (username, content, date) VALUES (?, ?, ?)"
  );
  stmt.run(username, content, date);
  console.log(username, content, date);
  res.send("ok");
});
const db = require('./db.cjs');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      pass TEXT,
      display_name TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS artist (
      artist_id INTEGER PRIMARY KEY AUTOINCREMENT,
      artist_name TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS song (
      song_id INTEGER PRIMARY KEY AUTOINCREMENT,
      song_name TEXT,
      genre TEXT,
      duration TEXT,
      song_path TEXT,
      image_path TEXT,
      artist_id INTEGER,
      album_id INTEGER
    )
  `);

  db.run(`
  CREATE TABLE IF NOT EXISTS albums (
    album_id INTEGER PRIMARY KEY AUTOINCREMENT,
    album_name TEXT,
    album_img TEXT,
    artist_id INTEGER
  )
`);

  db.run(`
    CREATE TABLE IF NOT EXISTS playlists (
      playlist_id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_name TEXT,
      user_id INTEGER,
      playlist_cover TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS playlist_songs (
      playlist_id INTEGER,
      song_id INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS liked_songs (
      user_id INTEGER,
      song_id INTEGER
    )
  `);
});

console.log('✅ Database initialized');

const express = require('express');
const db = require('./db.cjs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

/* ===================== AUTH ===================== */

app.post('/login', (req, res) => {
  const { username, pass } = req.body;

  db.get(
    'SELECT * FROM users WHERE username = ?',
    [username],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(400).json({ message: 'User not found' });

      if (user.pass === pass) {
        res.json({ message: 'Login successful', user_id: user.user_id });
      } else {
        res.status(400).json({ message: 'Invalid password' });
      }
    }
  );
});

app.post('/signup', (req, res) => {
  const { username, pass } = req.body;

  db.get(
    'SELECT user_id FROM users WHERE username = ?',
    [username],
    (err, row) => {
      if (row) return res.status(400).json({ message: 'Username already taken' });

      db.run(
        'INSERT INTO users (username, pass) VALUES (?, ?)',
        [username, pass],
        err => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ message: 'User registered successfully' });
        }
      );
    }
  );
});

/* ===================== SONGS ===================== */

app.get('/songs', (req, res) => {
  const { genre, keyword, album_id } = req.query;

  let query = `
    SELECT s.song_id, s.song_name, s.song_path, s.image_path,
           s.duration, s.genre, s.album_id, a.artist_name
    FROM song s
    JOIN artist a ON s.artist_id = a.artist_id
  `;

  const params = [];

  if (album_id) {
    query += ' WHERE s.album_id = ?';
    params.push(album_id);
  }

  if (genre && genre !== 'All' && genre !== 'None') {
    query += params.length ? ' AND s.genre = ?' : ' WHERE s.genre = ?';
    params.push(genre);
  }

  if (keyword) {
    query += params.length ? ' AND s.song_name LIKE ?' : ' WHERE s.song_name LIKE ?';
    params.push(`%${keyword}%`);
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/* ===================== ALBUMS ===================== */

app.get('/albums', (req, res) => {
  db.all(
    `SELECT al.album_id, al.album_name, al.album_img, ar.artist_name
     FROM albums al
     JOIN artist ar ON al.artist_id = ar.artist_id`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

/* ===================== USERS ===================== */

app.get('/users/:userId', (req, res) => {
  db.get(
    'SELECT username, display_name FROM users WHERE user_id = ?',
    [req.params.userId],
    (err, user) => {
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    }
  );
});

app.put('/dispname/:userId', (req, res) => {
  db.run(
    'UPDATE users SET display_name = ? WHERE user_id = ?',
    [req.body.display_name, req.params.userId],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Display name updated successfully' });
    }
  );
});

/* ===================== LIKED SONGS ===================== */

app.get('/liked_songs/:userId', (req, res) => {
  db.all(
    'SELECT song_id FROM liked_songs WHERE user_id = ?',
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post('/liked_songs/add', (req, res) => {
  db.run(
    'INSERT INTO liked_songs (user_id, song_id) VALUES (?, ?)',
    [req.body.user_id, req.body.song_id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.post('/liked_songs/remove', (req, res) => {
  db.run(
    'DELETE FROM liked_songs WHERE user_id = ? AND song_id = ?',
    [req.body.user_id, req.body.song_id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

/* ===================== PLAYLISTS ===================== */

app.get('/playlists/:userId', (req, res) => {
  db.all(
    'SELECT playlist_id, playlist_name, playlist_cover FROM playlists WHERE user_id = ?',
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post('/addPlaylist', (req, res) => {
  const { playlist_name, user_id, playlist_cover } = req.body;

  db.run(
    'INSERT INTO playlists (playlist_name, user_id, playlist_cover) VALUES (?, ?, ?)',
    [playlist_name, user_id, playlist_cover],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ playlist_id: this.lastID });
    }
  );
});

app.delete('/deleteplaylist', (req, res) => {
  db.run(
    'DELETE FROM playlists WHERE playlist_id = ?',
    [req.query.playlist_id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Playlist deleted successfully' });
    }
  );
});

/* ===================== PLAYLIST SONGS ===================== */

app.get('/allplaylistsongs', (req, res) => {
  db.all(
    `SELECT s.song_id, s.song_name, s.image_path, a.artist_name, s.song_path
     FROM playlist_songs ps
     JOIN song s ON ps.song_id = s.song_id
     JOIN artist a ON s.artist_id = a.artist_id
     WHERE ps.playlist_id = ?`,
    [req.query.playlist_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

app.post('/playlist_songs/add', (req, res) => {
  db.run(
    'INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)',
    [req.body.playlist_id, req.body.song_id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.post('/playlist_songs/remove', (req, res) => {
  db.run(
    'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?',
    [req.body.playlist_id, req.body.song_id],
    err => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

/* ===================== ADMIN ===================== */

app.get('/allusers', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) return res.status(500).send('Database error');
    res.json(rows);
  });
});

app.get('/allartists', (req, res) => {
  db.all('SELECT * FROM artist', [], (err, rows) => {
    if (err) return res.status(500).send('Database error');
    res.json(rows);
  });
});

app.post('/addartist', (req, res) => {
  db.run(
    'INSERT INTO artist (artist_name) VALUES (?)',
    [req.body.artist_name],
    err => {
      if (err) return res.status(500).send('Database error');
      res.send('Artist added successfully');
    }
  );
});

app.post('/addsong', (req, res) => {
  const { song_name, genre, duration, song_path, image_path, artist_id, album_id } = req.body;

  db.run(
    `INSERT INTO song 
     (song_name, genre, duration, song_path, image_path, artist_id, album_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [song_name, genre, duration, song_path, image_path, artist_id, album_id || null],
    err => {
      if (err) return res.status(500).send('Error adding song');
      res.send('Song added successfully');
    }
  );
});

/* ===================== SERVER ===================== */

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});

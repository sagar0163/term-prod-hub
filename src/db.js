import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const db = new Database(path.join(DATA_DIR, 'data.db'));

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY,
    text TEXT NOT NULL,
    created TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS clipboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS shortcuts (
    alias TEXT PRIMARY KEY,
    command TEXT NOT NULL
  );
`);

// Migrate old data if db is empty and json files exist
const notesCount = db.prepare('SELECT COUNT(*) as count FROM notes').get().count;
if (notesCount === 0) {
  const notesFile = path.join(DATA_DIR, 'notes.json');
  if (fs.existsSync(notesFile)) {
    try {
      const notes = JSON.parse(fs.readFileSync(notesFile, 'utf8'));
      const insert = db.prepare('INSERT INTO notes (id, text, created) VALUES (?, ?, ?)');
      const insertMany = db.transaction((notes) => {
        for (const note of notes) insert.run(note.id, note.text, note.created);
      });
      insertMany(notes);
    } catch (e) {}
  }
}

const clipCount = db.prepare('SELECT COUNT(*) as count FROM clipboard').get().count;
if (clipCount === 0) {
  const clipFile = path.join(DATA_DIR, 'clipboard.json');
  if (fs.existsSync(clipFile)) {
    try {
      const history = JSON.parse(fs.readFileSync(clipFile, 'utf8'));
      const insert = db.prepare('INSERT INTO clipboard (text, timestamp) VALUES (?, ?)');
      const insertMany = db.transaction((history) => {
        // reverse to insert oldest first so that auto-increment ID matches chronological order
        for (const item of history.slice().reverse()) insert.run(item.text, item.timestamp);
      });
      insertMany(history);
    } catch (e) {}
  }
}

const shortcutsCount = db.prepare('SELECT COUNT(*) as count FROM shortcuts').get().count;
if (shortcutsCount === 0) {
  const shortFile = path.join(DATA_DIR, 'shortcuts.json');
  if (fs.existsSync(shortFile)) {
    try {
      const shortcuts = JSON.parse(fs.readFileSync(shortFile, 'utf8'));
      const insert = db.prepare('INSERT INTO shortcuts (alias, command) VALUES (?, ?)');
      const insertMany = db.transaction((shortcuts) => {
        for (const [alias, command] of Object.entries(shortcuts)) insert.run(alias, command);
      });
      insertMany(shortcuts);
    } catch (e) {}
  }
}

export default db;

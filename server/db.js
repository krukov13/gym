const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'gym.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  weekday TEXT NOT NULL UNIQUE,       -- Monday..Sunday
  title TEXT NOT NULL,                -- e.g. "PUSH A"
  focus TEXT,                         -- e.g. "Chest · Shoulders · Triceps"
  equipment TEXT,                     -- e.g. "Free Weights"
  style TEXT,                         -- e.g. "Heavy" / "Volume"
  is_rest INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_id INTEGER NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_sets INTEGER,
  target_reps TEXT,                   -- e.g. "6-8" or "45sec"
  cue TEXT,                           -- form cue / instructions
  track_assist INTEGER NOT NULL DEFAULT 0, -- e.g. assisted pull-ups
  order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS set_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  date TEXT NOT NULL,                 -- YYYY-MM-DD
  set_number INTEGER NOT NULL,
  weight REAL,
  reps REAL,
  assist REAL,                        -- assist weight/band, if applicable
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS body_weight_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  weight REAL NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_set_logs_exercise_date ON set_logs(exercise_id, date);
CREATE INDEX IF NOT EXISTS idx_body_weight_date ON body_weight_logs(date);
`);

module.exports = db;

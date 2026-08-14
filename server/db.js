const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'gym.db');
const db = new Database(dbPath);
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

CREATE TABLE IF NOT EXISTS measurement_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,
  neck REAL,
  shoulders REAL,
  chest REAL,
  waist REAL,
  hips REAL,
  bicep_l REAL,
  bicep_r REAL,
  forearm_l REAL,
  forearm_r REAL,
  thigh_l REAL,
  thigh_r REAL,
  calf_l REAL,
  calf_r REAL,
  wrist_l REAL,
  wrist_r REAL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_set_logs_exercise_date ON set_logs(exercise_id, date);
CREATE INDEX IF NOT EXISTS idx_body_weight_date ON body_weight_logs(date);
CREATE INDEX IF NOT EXISTS idx_measurement_logs_date ON measurement_logs(date);
`);

module.exports = db;

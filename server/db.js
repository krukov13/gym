const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'gym.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  weekday TEXT NOT NULL UNIQUE,       -- a stable slug identifying the routine (not necessarily a calendar weekday)
  title TEXT NOT NULL,                -- e.g. "PUSH A"
  focus TEXT,                         -- e.g. "Chest · Shoulders · Triceps"
  equipment TEXT,                     -- e.g. "Free Weights"
  style TEXT,                         -- e.g. "Heavy" / "Volume"
  is_rest INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,  -- inactive = archived routine, kept only so old exercises/logs stay intact
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
  context_day_id INTEGER,             -- the routine this set was logged from (differs from the exercise's own routine for "extra" sets)
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

CREATE TABLE IF NOT EXISTS custom_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                 -- freeform, e.g. "Haircut", "Shave"
  date TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  ingredients TEXT,                   -- freeform, one per line
  instructions TEXT,                  -- freeform, one step per line
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_set_logs_exercise_date ON set_logs(exercise_id, date);
CREATE INDEX IF NOT EXISTS idx_body_weight_date ON body_weight_logs(date);
CREATE INDEX IF NOT EXISTS idx_measurement_logs_date ON measurement_logs(date);
CREATE INDEX IF NOT EXISTS idx_custom_logs_name_date ON custom_logs(name, date);
`);

// CREATE TABLE IF NOT EXISTS above only applies to brand-new databases —
// an already-existing `days` table (the live app) needs the new column
// added explicitly. Idempotent: only runs if the column is actually missing.
const daysColumns = db.prepare('PRAGMA table_info(days)').all();
if (!daysColumns.some((c) => c.name === 'active')) {
  db.exec('ALTER TABLE days ADD COLUMN active INTEGER NOT NULL DEFAULT 1');
}

// Same for set_logs.context_day_id. Existing sets were all logged from their
// exercise's own routine, so backfill them to that — which keeps them from
// ever being mistaken for "extra" sets on some other routine's page.
const setLogColumns = db.prepare('PRAGMA table_info(set_logs)').all();
if (!setLogColumns.some((c) => c.name === 'context_day_id')) {
  db.exec('ALTER TABLE set_logs ADD COLUMN context_day_id INTEGER');
  db.exec(
    'UPDATE set_logs SET context_day_id = (SELECT day_id FROM exercises WHERE exercises.id = set_logs.exercise_id)'
  );
}

module.exports = db;

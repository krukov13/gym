const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { seedIfEmpty } = require('./seed');

seedIfEmpty();

const app = express();
app.use(cors());
app.use(express.json());

// ---- Days & routine ----

app.get('/api/days', (req, res) => {
  const days = db.prepare('SELECT * FROM days ORDER BY order_index').all();
  const exercises = db.prepare('SELECT * FROM exercises ORDER BY order_index').all();
  const byDay = {};
  for (const ex of exercises) {
    (byDay[ex.day_id] ??= []).push(ex);
  }
  res.json(days.map((d) => ({ ...d, exercises: byDay[d.id] || [] })));
});

app.get('/api/days/:weekday', (req, res) => {
  const day = db.prepare('SELECT * FROM days WHERE weekday = ?').get(req.params.weekday);
  if (!day) return res.status(404).json({ error: 'Day not found' });
  const exercises = db
    .prepare('SELECT * FROM exercises WHERE day_id = ? ORDER BY order_index')
    .all(day.id);
  res.json({ ...day, exercises });
});

// ---- Exercises ----

app.get('/api/exercises', (req, res) => {
  res.json(db.prepare('SELECT * FROM exercises ORDER BY name').all());
});

// ---- Set logs ----

app.get('/api/exercises/:id/logs', (req, res) => {
  const logs = db
    .prepare('SELECT * FROM set_logs WHERE exercise_id = ? ORDER BY date, set_number')
    .all(req.params.id);
  res.json(logs);
});

// Logs for a given exercise+date (to prefill a session)
app.get('/api/exercises/:id/logs/:date', (req, res) => {
  const logs = db
    .prepare('SELECT * FROM set_logs WHERE exercise_id = ? AND date = ? ORDER BY set_number')
    .all(req.params.id, req.params.date);
  res.json(logs);
});

app.post('/api/logs', (req, res) => {
  const { exercise_id, date, set_number, weight, reps, assist, notes } = req.body;
  if (!exercise_id || !date || !set_number) {
    return res.status(400).json({ error: 'exercise_id, date and set_number are required' });
  }
  const info = db
    .prepare(
      `INSERT INTO set_logs (exercise_id, date, set_number, weight, reps, assist, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(exercise_id, date, set_number, weight ?? null, reps ?? null, assist ?? null, notes ?? null);
  res.status(201).json(db.prepare('SELECT * FROM set_logs WHERE id = ?').get(info.lastInsertRowid));
});

app.put('/api/logs/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM set_logs WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Log not found' });
  const { weight, reps, assist, notes } = req.body;
  db.prepare('UPDATE set_logs SET weight = ?, reps = ?, assist = ?, notes = ? WHERE id = ?').run(
    weight ?? existing.weight,
    reps ?? existing.reps,
    assist ?? existing.assist,
    notes ?? existing.notes,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM set_logs WHERE id = ?').get(req.params.id));
});

app.delete('/api/logs/:id', (req, res) => {
  db.prepare('DELETE FROM set_logs WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// ---- Body weight ----

app.get('/api/bodyweight', (req, res) => {
  res.json(db.prepare('SELECT * FROM body_weight_logs ORDER BY date').all());
});

app.post('/api/bodyweight', (req, res) => {
  const { date, weight, notes } = req.body;
  if (!date || weight == null) {
    return res.status(400).json({ error: 'date and weight are required' });
  }
  const existing = db.prepare('SELECT * FROM body_weight_logs WHERE date = ?').get(date);
  let row;
  if (existing) {
    db.prepare('UPDATE body_weight_logs SET weight = ?, notes = ? WHERE id = ?').run(
      weight,
      notes ?? null,
      existing.id
    );
    row = db.prepare('SELECT * FROM body_weight_logs WHERE id = ?').get(existing.id);
  } else {
    const info = db
      .prepare('INSERT INTO body_weight_logs (date, weight, notes) VALUES (?, ?, ?)')
      .run(date, weight, notes ?? null);
    row = db.prepare('SELECT * FROM body_weight_logs WHERE id = ?').get(info.lastInsertRowid);
  }
  res.status(201).json(row);
});

app.delete('/api/bodyweight/:id', (req, res) => {
  db.prepare('DELETE FROM body_weight_logs WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// ---- Serve the built frontend (client/dist), if present ----
// In local dev, Vite serves the frontend separately and this is skipped.
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (require('fs').existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

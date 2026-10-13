const db = require('./db');

// `weekday` here is a stable slug identifying the routine — it is NOT tied
// to a calendar day. The user picks which routine (A/B/C) to do on
// whichever real-world day they choose; the app just needs a stable key per
// routine to track exercises/logs against.
const days = [
  {
    weekday: 'full-body-a',
    title: 'Full Body A',
    focus: 'Chest · Upper Back · Glutes · Quads · Outer Hips · Lower Back',
    equipment: 'EGYM / Machines',
    style: 'Circuit · 2 rounds · ~35-40 min',
    exercises: [
      {
        name: 'Hip Thrust / Booty Builder',
        target_sets: 2,
        target_reps: '10-12',
        cue: 'Drive through the heels, lock hips out at top, zero knee/meniscus shear.',
      },
      {
        name: 'Brustpresse (Chest Press)',
        target_sets: 2,
        target_reps: '10-12',
        cue: 'Neutral/angled grips, wrists straight and locked, slow 2-second negative.',
      },
      {
        name: 'Ruderzug (Seated Row)',
        target_sets: 2,
        target_reps: '10-12',
        cue: 'Chest against pad or upright torso, pull through the elbows, squeeze back 1 second.',
      },
      {
        name: 'Beinstrecker (Leg Extension)',
        target_sets: 2,
        target_reps: '12-15',
        cue: 'Smooth extension, hard 1-second squeeze at the top, control the descent.',
      },
      {
        name: 'Abductor (Outer Thigh)',
        target_sets: 2,
        target_reps: '12-15',
        cue: 'Open knees wide against resistance, pause at peak expansion.',
      },
      {
        name: 'Rückentrainer (Back Extension)',
        target_sets: 2,
        target_reps: '10-12',
        cue: 'Controlled extension until torso aligns with hips, no hyperextension.',
      },
    ],
  },
  {
    weekday: 'full-body-b',
    title: 'Full Body B',
    focus: 'Lats · Shoulders · Hamstrings · Quads · Rotator Cuff · Abs',
    equipment: 'EGYM / Machines',
    style: 'Circuit · 2 rounds · ~35-40 min',
    exercises: [
      {
        name: 'Beinbeuger (Leg Curl)',
        target_sets: 2,
        target_reps: '10-12',
        cue: 'Pull heels toward glutes, 2-second controlled return, protects knee balance.',
      },
      {
        name: 'Latzug (Lat Pulldown)',
        target_sets: 2,
        target_reps: '10-12',
        cue: 'Pull bar down to upper chest, drive elbows into back pockets.',
      },
      {
        name: 'Schulterpresse (Shoulder Press)',
        target_sets: 2,
        target_reps: '10-12',
        cue: 'Use neutral handles if available to keep wrists aligned and shoulders safe.',
      },
      {
        name: 'Beinpresse (Leg Press)',
        target_sets: 2,
        target_reps: '15-20',
        cue: 'Meniscus-safe: strictly limit depth to ~90°, never let knees crunch to chest. Light-to-moderate weight, higher reps.',
      },
      {
        name: 'Rotator (Rotator Cuff)',
        target_sets: 2,
        target_reps: '12-15',
        cue: 'Light load, slow rotation — keeps the shoulder joint centered and bulletproof.',
      },
      {
        name: 'Bauchtrainer (Ab Crunch)',
        target_sets: 2,
        target_reps: '12-15',
        cue: 'Curl ribcage down toward pelvis, focus on abdominal contraction rather than hip pulling.',
      },
    ],
  },
  {
    weekday: 'full-body-c',
    title: 'Full Body C',
    focus: 'Chest · Rear Delts · Inner Thighs · Hamstrings/Glutes · Quads · Spinal Stability',
    equipment: 'EGYM / Machines',
    style: 'Circuit · 2 rounds · ~35-40 min',
    exercises: [
      {
        name: 'Hip Thrust / Booty Builder',
        target_sets: 2,
        target_reps: '10-12',
        cue: 'Full hip extension at top, pause 1 second.',
      },
      {
        name: 'Butterfly (Pec Fly)',
        target_sets: 2,
        target_reps: '12-15',
        cue: 'Slight bend in elbows, bring pads together, control the chest stretch.',
      },
      {
        name: 'Butterfly Reverse (Reverse Fly)',
        target_sets: 2,
        target_reps: '12-15',
        cue: 'Chest glued to pad, sweep arms back with rear delts, neutral wrist hold.',
      },
      {
        name: 'Adductor (Inner Thigh)',
        target_sets: 2,
        target_reps: '12-15',
        cue: 'Squeeze knees inward, pause 1 second, control the outward stretch.',
      },
      {
        name: 'Beinstrecker (Leg Extension)',
        target_sets: 2,
        target_reps: '12-15',
        cue: 'Direct terminal extension to reinforce quad strength around the knee joint.',
      },
      {
        name: 'Rückentrainer (Back Extension)',
        target_sets: 2,
        target_reps: '10-12',
        cue: 'Smooth tempo, solid bracing through the torso.',
      },
    ],
  },
];

const insertDay = db.prepare(`
  INSERT INTO days (weekday, title, focus, equipment, style, is_rest, active, order_index)
  VALUES (@weekday, @title, @focus, @equipment, @style, @is_rest, @active, @order_index)
`);

const insertExercise = db.prepare(`
  INSERT INTO exercises (day_id, name, target_sets, target_reps, cue, track_assist, order_index)
  VALUES (@day_id, @name, @target_sets, @target_reps, @cue, @track_assist, @order_index)
`);

const seed = db.transaction(() => {
  db.exec('DELETE FROM set_logs; DELETE FROM exercises; DELETE FROM days;');
  days.forEach((day, dayIndex) => {
    const info = insertDay.run({
      weekday: day.weekday,
      title: day.title,
      focus: day.focus || null,
      equipment: day.equipment || null,
      style: day.style || null,
      is_rest: day.is_rest ? 1 : 0,
      active: 1,
      order_index: dayIndex,
    });
    day.exercises.forEach((ex, exIndex) => {
      insertExercise.run({
        day_id: info.lastInsertRowid,
        name: ex.name,
        target_sets: ex.target_sets ?? null,
        target_reps: ex.target_reps ?? null,
        cue: ex.cue ?? null,
        track_assist: ex.track_assist ? 1 : 0,
        order_index: exIndex,
      });
    });
  });
});

function seedIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM days').get();
  if (count === 0) {
    seed();
    console.log('Database empty — seeded with default weekly routine.');
  }
}

const findDay = db.prepare('SELECT id FROM days WHERE weekday = ?');
const findExercise = db.prepare('SELECT id FROM exercises WHERE day_id = ? AND name = ?');
const updateExercise = db.prepare(`
  UPDATE exercises SET target_sets = @target_sets, target_reps = @target_reps,
    cue = @cue, track_assist = @track_assist, order_index = @order_index
  WHERE id = @id
`);
const updateDay = db.prepare(`
  UPDATE days SET title = @title, focus = @focus, equipment = @equipment, style = @style,
    is_rest = @is_rest, active = @active, order_index = @order_index
  WHERE id = @id
`);

// Upserts the routine (day) rows themselves — never deletes, so it's safe to
// run against a database that already has other, older routines in it. New
// routines in the `days` list get inserted active; routines already present
// get refreshed (and reactivated, in case they were previously archived).
function syncDays() {
  const run = db.transaction(() => {
    days.forEach((day, index) => {
      const params = {
        weekday: day.weekday,
        title: day.title,
        focus: day.focus || null,
        equipment: day.equipment || null,
        style: day.style || null,
        is_rest: day.is_rest ? 1 : 0,
        active: 1,
        order_index: index,
      };
      const existing = findDay.get(day.weekday);
      if (existing) {
        updateDay.run({ ...params, id: existing.id });
      } else {
        insertDay.run(params);
      }
    });
  });
  run();
}

// Archives (deactivates) any routine that is no longer in the `days` list
// above — e.g. after switching to a new weekly plan. Never deletes: the
// routine's exercises and every logged set against them stay intact and
// still show up in Progress, just hidden from the active workout picker.
function archiveStaleRoutines() {
  const currentSlugs = days.map((d) => d.weekday);
  const placeholders = currentSlugs.map(() => '?').join(', ');
  db.prepare(`UPDATE days SET active = 0 WHERE active = 1 AND weekday NOT IN (${placeholders})`).run(
    ...currentSlugs
  );
}

// Reconciles exercise definitions (name, target sets/reps, cue, order) against
// the routine above without ever deleting a row — safe to run on every boot,
// even against a database with existing logged sets. New exercises added to
// the `days` list above get inserted; existing ones get their details/order
// refreshed to match. Nothing referencing an exercise (set_logs) is touched.
function syncExercises() {
  const run = db.transaction(() => {
    for (const day of days) {
      const dayRecord = findDay.get(day.weekday);
      if (!dayRecord) continue; // fresh install — seedIfEmpty handles this case
      day.exercises.forEach((ex, index) => {
        const params = {
          day_id: dayRecord.id,
          name: ex.name,
          target_sets: ex.target_sets ?? null,
          target_reps: ex.target_reps ?? null,
          cue: ex.cue ?? null,
          track_assist: ex.track_assist ? 1 : 0,
          order_index: index,
        };
        const existing = findExercise.get(dayRecord.id, ex.name);
        if (existing) {
          updateExercise.run({ ...params, id: existing.id });
        } else {
          insertExercise.run(params);
        }
      });
    }
  });
  run();
}

// One-off, idempotent fix for exercises that switched to assist-tracking
// after already having logs: those old logs have their assist amount sitting
// in `weight` (the only field available before track_assist was turned on),
// which makes "less assist = improvement" look backwards on the chart. Moves
// weight -> assist for exactly the rows that need it; safe to run every boot
// since the WHERE clause only ever matches unmigrated rows.
function migrateWeightToAssist(exerciseName) {
  const exercise = db.prepare('SELECT id FROM exercises WHERE name = ?').get(exerciseName);
  if (!exercise) return;
  db.prepare(
    'UPDATE set_logs SET assist = weight, weight = NULL WHERE exercise_id = ? AND weight IS NOT NULL AND assist IS NULL'
  ).run(exercise.id);
}

// One-off, idempotent sign fix: assist is stored so that higher (closer to
// 0, or positive) is always the improvement — same convention as weight —
// which means an assist amount is a *negative* number of kg (e.g. -12 for
// 12kg of machine/band help, 0 once fully unassisted). Older data was
// entered as a positive "amount of assist used", which read backwards once
// the chart stopped special-casing assist. Flips any positive value negative
// for exactly the rows that still need it; safe to run every boot.
function normalizeAssistSign(exerciseName) {
  const exercise = db.prepare('SELECT id FROM exercises WHERE name = ?').get(exerciseName);
  if (!exercise) return;
  db.prepare('UPDATE set_logs SET assist = -assist WHERE exercise_id = ? AND assist > 0').run(exercise.id);
}

if (require.main === module) {
  seed();
  console.log('Seeded database with weekly routine (existing logs cleared).');
}

module.exports = {
  seed,
  seedIfEmpty,
  syncDays,
  syncExercises,
  archiveStaleRoutines,
  migrateWeightToAssist,
  normalizeAssistSign,
};

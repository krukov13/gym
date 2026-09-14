const db = require('./db');

const days = [
  {
    weekday: 'Monday',
    title: 'PUSH A',
    focus: 'Chest · Shoulders · Triceps',
    equipment: 'Free Weights',
    style: 'Heavy',
    exercises: [
      {
        name: 'Barbell Bench Press',
        target_sets: 4,
        target_reps: '6-8',
        cue: 'Flat bench. Grip slightly wider than shoulder width. Full range — bar touches chest, full lockout. 3s descent, explosive press.',
      },
      {
        name: 'Dumbbell Overhead Press',
        target_sets: 4,
        target_reps: '6-8',
        cue: 'Seated or standing. Dumbbells at ear height, press straight up. Avoid arching lower back — brace core throughout.',
      },
      {
        name: 'Incline Dumbbell Press',
        target_sets: 3,
        target_reps: '8',
        cue: '30–45° incline. Upper chest focus. Full range — stretch at bottom, squeeze at top.',
      },
      {
        name: 'Cable Pec Fly',
        target_sets: 3,
        target_reps: '12-15',
        cue: 'Cable crossover (or pec deck). Slight bend in elbows throughout, squeeze at the midline, controlled stretch on the return.',
      },
      {
        name: 'Dumbbell Lateral Raise',
        target_sets: 3,
        target_reps: '10-12',
        cue: 'Slight forward lean, slight elbow bend. Raise to shoulder height only — no higher. Slow 3s return.',
      },
      {
        name: 'Tricep Dips (Assisted or Bodyweight)',
        target_sets: 3,
        target_reps: '8-10',
        cue: 'Log the machine/band assistance used, in kg, in the Assist field — 0 once fully unassisted. Less assist is the improvement, same as any other lift getting easier.',
        track_assist: 1,
      },
      {
        name: 'Cardio',
        target_sets: 1,
        target_reps: '15 min',
      },
    ],
  },
  {
    weekday: 'Tuesday',
    title: 'PULL A',
    focus: 'Back · Lats · Rear Delts · Biceps',
    equipment: 'Free Weights',
    style: 'Heavy',
    exercises: [
      {
        name: 'Barbell Bent-Over Row',
        target_sets: 4,
        target_reps: '6-8',
        cue: 'Overhand grip, hinge at hips to ~45°, bar pulled to lower chest. Keep back flat — no rounding. Squeeze shoulder blades at top.',
      },
      {
        name: 'Weighted Pull-Ups',
        target_sets: 3,
        target_reps: '6',
        cue: 'If using machine/band assist, log it in kg in the Assist field — 0 once fully unassisted. Once unassisted, switch to the Weight field to log added weight (e.g. a dip belt).',
        track_assist: 1,
      },
      { name: 'Lat Pulldown', target_sets: 3, target_reps: '6-8' },
      { name: 'Dumbbell Single-Arm Row', target_sets: 3, target_reps: '6-8' },
      {
        name: 'Dumbbell Bicep Curl',
        target_sets: 3,
        target_reps: '10-12',
        cue: 'Neutral or supinated grip, elbows pinned to your sides. Full range — squeeze at top, controlled 3s negative, no swinging.',
      },
      { name: 'Dumbbell Rear Delt Fly', target_sets: 3, target_reps: '10-12' },
      { name: 'Cardio', target_sets: 1, target_reps: '15 min' },
    ],
  },
  {
    weekday: 'Wednesday',
    title: 'LEGS A',
    focus: 'Hamstrings · Glutes · Quads (limited)',
    equipment: 'EGYM',
    style: 'Volume',
    exercises: [
      { name: 'Leg Curl', target_sets: 4, target_reps: '10-12' },
      { name: 'Leg Extension', target_sets: 4, target_reps: '10-12' },
      { name: 'Adductor', target_sets: 3, target_reps: '12-15' },
      { name: 'Abductor', target_sets: 3, target_reps: '12-15' },
      { name: 'Hip Extension (Glute Kickback)', target_sets: 3, target_reps: '12-15' },
      { name: 'Wall Sit', target_sets: 3, target_reps: '45 sec' },
    ],
  },
  {
    weekday: 'Thursday',
    title: 'PUSH B',
    focus: 'Chest · Shoulders · Triceps',
    equipment: 'EGYM',
    style: 'Volume',
    exercises: [
      { name: 'EGYM Chest Press', target_sets: 3, target_reps: '10-12' },
      { name: 'EGYM Shoulder Press', target_sets: 3, target_reps: '10-12' },
      { name: 'EGYM Butterfly (Pec Deck)', target_sets: 3, target_reps: '10-12' },
      { name: 'EGYM Lateral Raise Machine', target_sets: 3, target_reps: '10-12' },
      {
        name: 'Tricep Extension (Cable Rope Pushdown)',
        target_sets: 3,
        target_reps: '10-12',
        cue: 'No EGYM equivalent — substitute: cable rope pushdown, or dumbbell overhead tricep extension if no cable station is free.',
      },
      { name: 'Cardio', target_sets: 1, target_reps: '15 min' },
    ],
  },
  {
    weekday: 'Friday',
    title: 'PULL B',
    focus: 'Back · Lats · Rear Delts · Biceps',
    equipment: 'EGYM',
    style: 'Volume',
    exercises: [
      { name: 'EGYM Lat Pulldown', target_sets: 3, target_reps: '10-12' },
      { name: 'EGYM Seated Row', target_sets: 3, target_reps: '10-12' },
      { name: 'EGYM Reverse Flys', target_sets: 3, target_reps: '10-12' },
      { name: 'Bicep Curl', target_sets: 3, target_reps: '10-12' },
      { name: 'EGYM Back Extension', target_sets: 3, target_reps: '10-12' },
      { name: 'Cardio', target_sets: 1, target_reps: '15 min' },
    ],
  },
  {
    weekday: 'Saturday',
    title: 'LEGS B + CORE',
    focus: 'Glutes · Hamstrings · Core',
    equipment: 'Free Weights',
    style: 'Meniscus-safe',
    exercises: [
      { name: 'Romanian Deadlift (Dumbbell or Barbell)', target_sets: 4, target_reps: '8-10' },
      { name: 'Dumbbell Hip Thrust (on bench)', target_sets: 4, target_reps: '10-12' },
      { name: 'Cable Pull-Through or Dumbbell Kickback', target_sets: 3, target_reps: '12-15' },
      { name: 'Plank', target_sets: 3, target_reps: '60 sec' },
      { name: 'Cable Crunch or Ab Machine', target_sets: 3, target_reps: '12-15' },
      { name: 'Cardio', target_sets: 1, target_reps: null },
    ],
  },
  {
    weekday: 'Sunday',
    title: 'FULL REST',
    focus: 'Recovery · Sleep · No Training',
    equipment: null,
    style: null,
    is_rest: 1,
    exercises: [],
  },
];

const insertDay = db.prepare(`
  INSERT INTO days (weekday, title, focus, equipment, style, is_rest, order_index)
  VALUES (@weekday, @title, @focus, @equipment, @style, @is_rest, @order_index)
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

module.exports = { seed, seedIfEmpty, syncExercises, migrateWeightToAssist, normalizeAssistSign };

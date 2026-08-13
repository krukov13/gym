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
        name: 'Dumbbell Lateral Raise',
        target_sets: 3,
        target_reps: '10-12',
        cue: 'Slight forward lean, slight elbow bend. Raise to shoulder height only — no higher. Slow 3s return.',
      },
      {
        name: 'Tricep Dips (Assisted or Bodyweight)',
        target_sets: 3,
        target_reps: '8-10',
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
        cue: 'Track assist amount if used.',
        track_assist: 1,
      },
      { name: 'Lat Pulldown', target_sets: 3, target_reps: '6-8' },
      { name: 'Dumbbell Single-Arm Row', target_sets: 3, target_reps: '6-8' },
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

if (require.main === module) {
  seed();
  console.log('Seeded database with weekly routine (existing logs cleared).');
}

module.exports = { seed, seedIfEmpty };

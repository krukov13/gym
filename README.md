# Gym Tracker

A personal workout & body-weight progress tracker. Log the weight/reps you hit
on each exercise in your routine and your body weight over time, then watch
progress charts move.

Pre-seeded with a 3-day Full Body A/B/C EGYM circuit routine (2 rounds per
machine). Routines aren't tied to calendar days — pick whichever one (A, B,
or C) you're doing today from the Workout tab, in any order, on any day.

## Stack

- **Server**: Node/Express + SQLite (`better-sqlite3`)
- **Client**: React + Vite, `react-router-dom` for pages, `recharts` for charts

## Getting started

```bash
npm run install:all   # installs server + client dependencies
npm run seed           # (re)seeds the database with your weekly routine
npm run dev             # runs API (port 3001) and web app (port 5173) together
```

Then open the URL Vite prints (usually http://localhost:5173).

The SQLite database lives at `server/gym.db` (or `$DB_PATH` if set) and is
created automatically. **`npm run seed` wipes and rewrites the routine, your
logged sets, and clears everything back to a fresh slate** — only run it
intentionally (e.g. after editing the routine in `server/seed.js`). Body-weight
entries are untouched by seeding. In production the server only auto-seeds
once, on first boot when the database is empty — it never re-seeds over
existing data.

## Features

- **Workout** — pick which routine (Full Body A/B/C) you're doing today —
  not tied to the calendar, pick any of them on any day — and log weight/reps
  per set for each exercise (extra sets can be added), editing a past date
  via the date picker. A picker at the bottom lets you log any exercise from
  anywhere in the app — not just today's routine — as a one-off "Extra" for
  just that date, without permanently adding it to the routine; it still
  shows up in Progress like any other logged set, and reappears here
  automatically if you revisit that date.
  Assisted pull-ups and tricep dips have a dedicated "assist" field (kg of
  machine/band help used) — stored as <= 0 (0 = unassisted, -12 = 12kg of
  help) so higher is always the improvement, same as weight. Type a positive
  number out of habit and the server negates it for you automatically. A
  stat card up top shows gym attendance: sessions this month, last month,
  and all-time (any date with at least one logged set counts as a session).
- **Progress** — pick any exercise and see a line chart plus
  latest/best/change-since-first-log stats. Each day's chart point is your
  best set (PR) for regular lifts, or the average across that day's sets for
  assist-tracked exercises (assist naturally varies a lot within one session
  as you fatigue, so a single best set would hide how the rest went). For
  regular lifts, a "Chart by" toggle switches between raw top-set weight and
  **Estimated 1RM** (Epley formula), which combines weight and reps into one
  number so a heavier-but-lower-rep set doesn't automatically look like
  progress over a lighter-but-higher-rep one. Below the chart, every logged
  set for that exercise is listed and directly editable (weight/reps/assist)
  or deletable — use this to fix mistakes, like a logging-convention change
  (e.g. switching a dumbbell exercise from
  "per-hand" to "total" weight, which otherwise looks like an overnight PR).
- **Body Weight** — log your body weight by date, see the trend chart and a
  full history table.
- **Measurements** — log body circumference (cm) by date: neck, shoulders,
  chest, waist, hips, biceps/forearm/wrist/thigh/calf (left & right). All
  fields are optional per entry. Pick any measurement to chart, plus a full
  history table.
- **Other** — track any recurring thing by name and date (haircut, shave,
  nails, ...) — type a new name or pick an existing one. Shows the average
  number of days between entries per name and a predicted next-due date,
  sorted with the most overdue item first.
- **Recipes** — save a title, ingredients, instructions, and optional notes.
  Each recipe is collapsed to just its title in the list; click it to expand
  in place (accordion-style) and reveal the full recipe, with Edit/Delete
  inline.

## Deploying to Railway

The server also serves the built frontend, so this is a single Railway
service — one deploy, one URL.

1. **Push this code to GitHub** (already done if you're reading this from the
   repo) — Railway deploys straight from a GitHub repo.
2. Go to [railway.app](https://railway.app) and sign in (GitHub login is
   easiest).
3. **New Project → Deploy from GitHub repo** → pick `krukov13/gym` → pick the
   branch you want live (e.g. `claude/workout-progress-tracker-8k23sn`, or
   merge to `main` first if you'd rather deploy that).
4. Railway auto-detects Node and uses this repo's `build` and `start` npm
   scripts — no extra config needed. First deploy will fail fast if something's
   off; check the build logs in the Railway dashboard if so.
5. **Add persistent storage** (critical — without this your data resets on
   every redeploy): open the service → **Settings → Volumes → New Volume**,
   mount path `/data`.
6. **Set an environment variable**: `DB_PATH=/data/gym.db`. Railway sets `PORT`
   automatically — you don't need to touch that.
7. **Get a public URL**: **Settings → Networking → Generate Domain**.
8. Open that URL — the first request auto-seeds your routine into the fresh
   database. From then on your logged sets and body weight persist across
   deploys.
9. On your phone, open the URL in Safari/Chrome and use **Add to Home
   Screen** so it launches like an app.

Every time you `git push` to the connected branch, Railway redeploys
automatically.

## Customizing the routine

Edit the `days` list in `server/seed.js` — each entry is a routine (name,
focus, a stable `weekday` slug used as its key) with its own list of
exercises (name, target sets/reps, form cue, whether to track an assist
weight). **Don't run `npm run seed`** to apply changes to a database that
already has logged data — it's a full destructive reset (wipes every
logged set) meant only for a truly fresh install. Instead just edit
`seed.js` and redeploy: the server reconciles the live database against it
automatically on every boot (`syncDays` + `syncExercises`), inserting new
routines/exercises and updating existing ones in place, while routines
removed from the list are archived (hidden from the picker, not deleted —
their exercises and logged history stay intact and still show up in
Progress). This is exactly how the switch from the old 6-day split to the
3-day Full Body routine was done.

## Project structure

```
server/   Express API + SQLite schema/seed (server/db.js, server/seed.js, server/index.js, server/measurementFields.js)
client/   React app (client/src/pages, client/src/components)
```

# Gym Tracker

A personal workout & body-weight progress tracker. Log the weight/reps you hit
on each exercise in your weekly routine and your body weight over time, then
watch progress charts move.

Pre-seeded with a 6-day push/pull/legs split (Monday–Saturday), Sunday as a
rest day.

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

- **Workout** — pick a day of the week, log weight/reps per set for each
  exercise (extra sets can be added), edit a past date via the date picker.
  Assisted pull-ups have a dedicated "assist" field.
- **Progress** — pick any exercise and see a line chart of your top set's
  weight over time, plus latest/best/change-since-first-log stats.
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

Edit `server/seed.js` — it's a plain list of days/exercises (name, target
sets/reps, form cue, whether to track an assist weight). Run `npm run seed`
to apply changes.

## Project structure

```
server/   Express API + SQLite schema/seed (server/db.js, server/seed.js, server/index.js, server/measurementFields.js)
client/   React app (client/src/pages, client/src/components)
```

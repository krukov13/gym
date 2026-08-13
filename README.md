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

The SQLite database lives at `server/gym.db` and is created automatically.
Re-running `npm run seed` resets the routine (days/exercises) but leaves your
logged sets and body-weight history in place, unless you also wipe the file.

## Features

- **Workout** — pick a day of the week, log weight/reps per set for each
  exercise (extra sets can be added), edit a past date via the date picker.
  Assisted pull-ups have a dedicated "assist" field.
- **Progress** — pick any exercise and see a line chart of your top set's
  weight over time, plus latest/best/change-since-first-log stats.
- **Body Weight** — log your body weight by date, see the trend chart and a
  full history table.

## Customizing the routine

Edit `server/seed.js` — it's a plain list of days/exercises (name, target
sets/reps, form cue, whether to track an assist weight). Run `npm run seed`
to apply changes.

## Project structure

```
server/   Express API + SQLite schema/seed (server/db.js, server/seed.js, server/index.js)
client/   React app (client/src/pages, client/src/components)
```

import { useEffect, useMemo, useState, useCallback } from 'react';
import { api } from '../api.js';
import TrendChart from '../components/TrendChart.jsx';
import LogHistoryTable from '../components/LogHistoryTable.jsx';

// Epley formula: estimates the weight you could lift for 1 rep, given a
// weight/reps pair. Lets a 10-rep set at less weight and a 6-rep set at more
// weight be compared on equal footing instead of just eyeballing raw
// weight — otherwise a heavier top set always looks like "progress" even
// when it was actually a worse overall effort (fewer total reps for a
// similar or lower estimated max).
function estimatedOneRepMax(weight, reps) {
  if (weight == null || reps == null || reps <= 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

// Assist is stored so that higher (closer to 0, e.g. -12 -> -6 -> 0) is
// always the improvement, same convention as weight — no sign-flipping
// needed here.
//
// Aggregation differs by kind: a weight day is represented by its best set
// (PR, or best estimated 1RM if that metric is selected). An assist day is
// represented by the *average* across its sets — assist naturally varies a
// lot within one session (harder on later, fatigued sets), so the best
// single set alone hides how the rest of the session actually went.
function buildSeries(logs, metric) {
  const byDate = new Map();
  for (const log of logs) {
    const hasWeight = log.weight !== null && log.weight !== undefined;
    const hasAssist = log.assist !== null && log.assist !== undefined;
    if (!hasWeight && !hasAssist) continue;
    const isAssist = !hasWeight && hasAssist;
    const value = isAssist
      ? log.assist
      : metric === 'e1rm'
        ? estimatedOneRepMax(log.weight, log.reps)
        : log.weight;
    const bucket = byDate.get(log.date) ?? { values: [], isAssist };
    bucket.values.push(value);
    byDate.set(log.date, bucket);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, { values, isAssist }]) => ({
      date,
      value: isAssist ? values.reduce((a, b) => a + b, 0) / values.length : Math.max(...values),
    }));
}

export default function ProgressPage() {
  const [exercises, setExercises] = useState([]);
  const [days, setDays] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metric, setMetric] = useState('weight');

  useEffect(() => {
    Promise.all([api.getExercises(), api.getDays()]).then(([ex, d]) => {
      const trainable = ex.filter((e) => e.name !== 'Cardio');
      setExercises(trainable);
      setDays(d);
      if (trainable.length > 0) setSelectedId(String(trainable[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    api
      .getExerciseLogs(selectedId)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [selectedId]);

  const refreshLogs = useCallback(() => {
    if (!selectedId) return Promise.resolve();
    return api.getExerciseLogs(selectedId).then(setLogs);
  }, [selectedId]);

  const exercise = exercises.find((e) => String(e.id) === selectedId);
  const series = useMemo(() => buildSeries(logs, metric), [logs, metric]);
  const usingAssist =
    Boolean(exercise?.track_assist) &&
    logs.some((l) => l.assist != null) &&
    !logs.some((l) => l.weight != null);

  const dayLabel = (dayId) => days.find((d) => d.id === dayId)?.weekday;

  const stats = useMemo(() => {
    if (series.length === 0) return null;
    const first = series[0].value;
    const last = series[series.length - 1].value;
    const best = Math.max(...series.map((s) => s.value));
    return { first, last, best, delta: last - first };
  }, [series]);

  return (
    <div>
      <div className="field-row" style={{ marginBottom: 18 }}>
        <div className="field">
          <label htmlFor="exercise-select">Exercise</label>
          <select
            id="exercise-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name} ({dayLabel(ex.day_id)})
              </option>
            ))}
          </select>
        </div>
        {!usingAssist && (
          <div className="field">
            <label htmlFor="metric-select">Chart by</label>
            <select id="metric-select" value={metric} onChange={(e) => setMetric(e.target.value)}>
              <option value="weight">Top set weight</option>
              <option value="e1rm">Estimated 1RM</option>
            </select>
          </div>
        )}
      </div>

      {!usingAssist && metric === 'e1rm' && (
        <p className="exercise-cue" style={{ marginTop: -10, marginBottom: 16 }}>
          Estimated 1RM (Epley formula) combines weight and reps into one
          number, so a 10-rep set at less weight and a 6-rep set at more
          weight can be compared fairly — a heavier top set won't look like
          progress if it was actually fewer effective reps.
        </p>
      )}

      <div className="card">
        {stats && (
          <div className="stat-row">
            <div className="stat-tile">
              <div className="value">
                {stats.last} {usingAssist ? 'kg assist' : 'kg'}
              </div>
              <div className="label">Latest</div>
            </div>
            <div className="stat-tile">
              <div className="value">{stats.best}</div>
              <div className="label">
                {usingAssist ? 'Closest to unassisted (kg)' : metric === 'e1rm' ? 'Best est. 1RM (kg)' : 'Best (kg)'}
              </div>
            </div>
            <div className="stat-tile">
              <div className={`value ${stats.delta >= 0 ? 'delta-up' : 'delta-down'}`}>
                {stats.delta > 0 ? '+' : ''}
                {stats.delta.toFixed(1)} kg
              </div>
              <div className="label">Change since first log</div>
            </div>
          </div>
        )}
        {!loading && (
          <TrendChart
            data={series}
            unit={usingAssist ? 'kg assist (session avg)' : metric === 'e1rm' ? 'kg (est. 1RM)' : 'kg (top set)'}
          />
        )}
      </div>

      <div className="card">
        <div className="exercise-target" style={{ marginBottom: 10 }}>
          All logged sets — edit or delete a row to fix a mistake (e.g. a
          logging-convention change like per-hand vs. total dumbbell weight).
        </div>
        <LogHistoryTable exercise={exercise} logs={logs} onChange={refreshLogs} />
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import TrendChart from '../components/TrendChart.jsx';

function buildSeries(logs) {
  const byDate = new Map();
  for (const log of logs) {
    const hasWeight = log.weight !== null && log.weight !== undefined;
    const hasAssist = log.assist !== null && log.assist !== undefined;
    if (!hasWeight && !hasAssist) continue;
    const value = hasWeight ? log.weight : -log.assist;
    const cur = byDate.get(log.date);
    if (cur === undefined || value > cur) byDate.set(log.date, value);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, value]) => ({ date, value }));
}

export default function ProgressPage() {
  const [exercises, setExercises] = useState([]);
  const [days, setDays] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const exercise = exercises.find((e) => String(e.id) === selectedId);
  const series = useMemo(() => buildSeries(logs), [logs]);
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
      </div>

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
              <div className="value">{usingAssist ? Math.min(...series.map((s) => -s.value)) : stats.best}</div>
              <div className="label">{usingAssist ? 'Least assist (kg)' : 'Best (kg)'}</div>
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
        {!loading && <TrendChart data={series} unit={usingAssist ? 'kg assist (top set)' : 'kg (top set)'} />}
      </div>
    </div>
  );
}

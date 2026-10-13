import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import ExerciseCard from '../components/ExerciseCard.jsx';
import SessionStats from '../components/SessionStats.jsx';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function WorkoutPage() {
  const { weekday } = useParams();
  const navigate = useNavigate();
  const [allDays, setAllDays] = useState(null);
  const [day, setDay] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // The list of routines you can currently pick between — not calendar days,
  // just whichever routines are active, in the order they're defined.
  const activeDays = useMemo(
    () => (allDays ?? []).filter((d) => d.active).sort((a, b) => a.order_index - b.order_index),
    [allDays]
  );

  useEffect(() => {
    api.getDays().then(setAllDays);
  }, []);

  // No routine picked yet (e.g. landing on "/") — default to the first active one.
  useEffect(() => {
    if (!weekday && activeDays.length > 0) {
      navigate(`/day/${activeDays[0].weekday}`, { replace: true });
    }
  }, [weekday, activeDays, navigate]);

  const load = useCallback(() => {
    if (!weekday) return;
    setLoading(true);
    setError(null);
    api
      .getDay(weekday)
      .then(setDay)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [weekday]);

  useEffect(load, [load]);

  return (
    <div>
      <SessionStats />
      <div className="day-picker">
        {activeDays.map((d) => (
          <a
            key={d.weekday}
            href={`/day/${d.weekday}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/day/${d.weekday}`);
            }}
            className={`day-pill${d.weekday === weekday ? ' active' : ''}`}
          >
            {d.title}
          </a>
        ))}
      </div>

      {error && <p className="chart-empty">{error}</p>}
      {loading && !day && <p className="chart-empty">Loading…</p>}

      {day && (
        <>
          <div className="day-header">
            <p className="title">{day.title}</p>
            <p className="meta">
              {day.focus}
              {day.equipment ? ` — ${day.equipment}${day.style ? ` · ${day.style}` : ''}` : ''}
            </p>
          </div>

          {!day.is_rest && (
            <div className="field-row" style={{ marginBottom: 18 }}>
              <div className="field">
                <label htmlFor="log-date">Log date</label>
                <input
                  id="log-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {day.is_rest ? (
            <div className="rest-day">
              <p style={{ fontSize: '2rem', margin: 0 }}>😴</p>
              <p>Full rest day. Recovery, sleep, no training.</p>
            </div>
          ) : (
            day.exercises.map((ex) => <ExerciseCard key={ex.id} exercise={ex} date={date} />)
          )}
        </>
      )}
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { WEEKDAYS } from '../App.jsx';
import ExerciseCard from '../components/ExerciseCard.jsx';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function WorkoutPage() {
  const { weekday } = useParams();
  const navigate = useNavigate();
  const [day, setDay] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
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
      <div className="day-picker">
        {WEEKDAYS.map((wd) => (
          <a
            key={wd}
            href={`/day/${wd}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/day/${wd}`);
            }}
            className={`day-pill${wd === weekday ? ' active' : ''}`}
          >
            {wd.slice(0, 3)}
          </a>
        ))}
      </div>

      {error && <p className="chart-empty">{error}</p>}
      {loading && !day && <p className="chart-empty">Loading…</p>}

      {day && (
        <>
          <div className="day-header">
            <p className="title">
              {day.title} {day.is_rest ? '' : `· ${weekday}`}
            </p>
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

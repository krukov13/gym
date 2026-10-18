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
  const [allExercises, setAllExercises] = useState([]);
  const [day, setDay] = useState(null);
  const [date, setDate] = useState(todayISO());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manualExtraIds, setManualExtraIds] = useState([]);
  const [loggedExtraIds, setLoggedExtraIds] = useState([]);

  // The list of routines you can currently pick between — not calendar days,
  // just whichever routines are active, in the order they're defined.
  const activeDays = useMemo(
    () => (allDays ?? []).filter((d) => d.active).sort((a, b) => a.order_index - b.order_index),
    [allDays]
  );

  useEffect(() => {
    api.getDays().then(setAllDays);
    api.getExercises().then(setAllExercises);
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

  // Picking a new day or date clears exercises picked via the "+" menu this
  // session — anything already logged for that date reappears automatically
  // via loggedExtraIds below, so nothing is actually lost.
  useEffect(() => {
    setManualExtraIds([]);
  }, [weekday, date]);

  const regularIds = useMemo(() => new Set((day?.exercises ?? []).map((e) => e.id)), [day]);

  // Any exercise with a logged set on this date that ISN'T part of today's
  // regular routine — these are "extra" exercises logged just for this one
  // time, so they should keep showing up here (not just in Progress) if you
  // reload or come back to this date later.
  useEffect(() => {
    if (!day || day.is_rest) {
      setLoggedExtraIds([]);
      return;
    }
    api.getLogsForDate(date).then((logs) => {
      const extra = [...new Set(logs.map((l) => l.exercise_id))].filter((id) => !regularIds.has(id));
      setLoggedExtraIds(extra);
    });
  }, [date, day, regularIds]);

  const extraIds = useMemo(
    () => [...new Set([...manualExtraIds, ...loggedExtraIds])],
    [manualExtraIds, loggedExtraIds]
  );
  const extraExercises = useMemo(
    () => extraIds.map((id) => allExercises.find((e) => e.id === id)).filter(Boolean),
    [extraIds, allExercises]
  );

  const dayTitleById = useMemo(() => {
    const map = {};
    (allDays ?? []).forEach((d) => {
      map[d.id] = d.title;
    });
    return map;
  }, [allDays]);

  const pickerOptions = useMemo(
    () =>
      allExercises
        .filter((e) => e.name !== 'Cardio' && !regularIds.has(e.id) && !extraIds.includes(e.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [allExercises, regularIds, extraIds]
  );

  const removeExtra = (id) => {
    setManualExtraIds((prev) => prev.filter((x) => x !== id));
    setLoggedExtraIds((prev) => prev.filter((x) => x !== id));
  };

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
            <>
              {day.exercises.map((ex) => (
                <ExerciseCard key={ex.id} exercise={ex} date={date} />
              ))}
              {extraExercises.map((ex) => (
                <ExerciseCard
                  key={`extra-${ex.id}`}
                  exercise={ex}
                  date={date}
                  badge="Extra"
                  onRemove={() => removeExtra(ex.id)}
                />
              ))}

              <div className="card">
                <label
                  htmlFor="extra-picker"
                  style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}
                >
                  Did something extra today, outside this routine?
                </label>
                <select
                  id="extra-picker"
                  className="add-set-btn"
                  style={{ width: '100%' }}
                  value=""
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    if (id) setManualExtraIds((prev) => [...prev, id]);
                    e.target.value = '';
                  }}
                >
                  <option value="">+ Pick an exercise to log just for today…</option>
                  {pickerOptions.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                      {dayTitleById[ex.day_id] ? ` (${dayTitleById[ex.day_id]})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

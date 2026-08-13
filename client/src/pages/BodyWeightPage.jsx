import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import TrendChart from '../components/TrendChart.jsx';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function BodyWeightPage() {
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(todayISO());
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.getBodyWeight().then(setEntries);

  useEffect(() => {
    load();
  }, []);

  const series = useMemo(
    () => entries.map((e) => ({ date: e.date, value: e.weight })),
    [entries]
  );

  const stats = useMemo(() => {
    if (entries.length === 0) return null;
    const sorted = [...entries].sort((a, b) => (a.date < b.date ? -1 : 1));
    const first = sorted[0].weight;
    const last = sorted[sorted.length - 1].weight;
    return { first, last, delta: last - first };
  }, [entries]);

  const submit = async (e) => {
    e.preventDefault();
    if (weight === '') return;
    setSaving(true);
    try {
      await api.addBodyWeight({ date, weight: Number(weight) });
      setWeight('');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const removeEntry = async (id) => {
    await api.deleteBodyWeight(id);
    await load();
  };

  const sortedDesc = [...entries].sort((a, b) => (a.date > b.date ? -1 : 1));

  return (
    <div>
      <div className="card">
        <form className="field-row" onSubmit={submit}>
          <div className="field">
            <label htmlFor="bw-date">Date</label>
            <input id="bw-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="bw-weight">Weight (kg)</label>
            <input
              id="bw-weight"
              type="number"
              inputMode="decimal"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 78.5"
            />
          </div>
          <button className="primary-btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Log weight'}
          </button>
        </form>
      </div>

      <div className="card">
        {stats && (
          <div className="stat-row">
            <div className="stat-tile">
              <div className="value">{stats.last} kg</div>
              <div className="label">Latest</div>
            </div>
            <div className="stat-tile">
              <div className={`value ${stats.delta <= 0 ? 'delta-up' : 'delta-down'}`}>
                {stats.delta > 0 ? '+' : ''}
                {stats.delta.toFixed(1)} kg
              </div>
              <div className="label">Change since first log</div>
            </div>
          </div>
        )}
        <TrendChart data={series} unit="kg" />
      </div>

      {entries.length > 0 && (
        <div className="card">
          <table className="bw-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight (kg)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedDesc.map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.weight}</td>
                  <td>
                    <button className="icon-btn" onClick={() => removeEntry(e.id)} aria-label="Delete entry">
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

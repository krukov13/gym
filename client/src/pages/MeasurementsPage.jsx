import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import TrendChart from '../components/TrendChart.jsx';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function emptyForm(fields) {
  const form = {};
  for (const f of fields) form[f.key] = '';
  return form;
}

export default function MeasurementsPage() {
  const [fields, setFields] = useState([]);
  const [entries, setEntries] = useState([]);
  const [date, setDate] = useState(todayISO());
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [chartField, setChartField] = useState('');

  useEffect(() => {
    Promise.all([api.getMeasurementFields(), api.getMeasurements()]).then(([f, e]) => {
      setFields(f);
      setEntries(e);
      setForm(emptyForm(f));
      if (f.length > 0) setChartField(f[0].key);
    });
  }, []);

  useEffect(() => {
    if (fields.length === 0) return;
    const existing = entries.find((e) => e.date === date);
    if (existing) {
      const next = {};
      for (const f of fields) next[f.key] = existing[f.key] ?? '';
      setForm(next);
    } else {
      setForm(emptyForm(fields));
    }
    setSaved(false);
  }, [date, entries, fields]);

  const groups = useMemo(() => {
    const byGroup = {};
    for (const f of fields) (byGroup[f.group] ??= []).push(f);
    return byGroup;
  }, [fields]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.addMeasurement({ date, ...form });
      const fresh = await api.getMeasurements();
      setEntries(fresh);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const removeEntry = async (id) => {
    await api.deleteMeasurement(id);
    setEntries(await api.getMeasurements());
  };

  const chartSeries = useMemo(() => {
    if (!chartField) return [];
    return entries
      .filter((e) => e[chartField] != null)
      .map((e) => ({ date: e.date, value: e[chartField] }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [entries, chartField]);

  const chartStats = useMemo(() => {
    if (chartSeries.length === 0) return null;
    const first = chartSeries[0].value;
    const last = chartSeries[chartSeries.length - 1].value;
    return { last, delta: last - first };
  }, [chartSeries]);

  const sortedDesc = [...entries].sort((a, b) => (a.date > b.date ? -1 : 1));

  return (
    <div>
      <div className="card">
        <div className="field-row" style={{ marginBottom: 16 }}>
          <div className="field">
            <label htmlFor="m-date">Date</label>
            <input id="m-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        {Object.entries(groups).map(([group, groupFields]) => (
          <div key={group} style={{ marginBottom: 14 }}>
            <div className="exercise-target" style={{ marginBottom: 6 }}>
              {group} (cm)
            </div>
            <div className="field-row">
              {groupFields.map((f) => (
                <div className="field" key={f.key} style={{ width: 100 }}>
                  <label htmlFor={`f-${f.key}`}>{f.label}</label>
                  <input
                    id={`f-${f.key}`}
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={form[f.key] ?? ''}
                    onChange={(e) => updateField(f.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="primary-btn" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save measurements'}
          </button>
          {saved && <span className="saved-flash">Saved ✓</span>}
        </div>
      </div>

      <div className="card">
        <div className="field-row" style={{ marginBottom: 12 }}>
          <div className="field">
            <label htmlFor="m-chart-field">Chart</label>
            <select id="m-chart-field" value={chartField} onChange={(e) => setChartField(e.target.value)}>
              {fields.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {chartStats && (
          <div className="stat-row">
            <div className="stat-tile">
              <div className="value">{chartStats.last} cm</div>
              <div className="label">Latest</div>
            </div>
            <div className="stat-tile">
              <div className="value">
                {chartStats.delta > 0 ? '+' : ''}
                {chartStats.delta.toFixed(1)} cm
              </div>
              <div className="label">Change since first log</div>
            </div>
          </div>
        )}
        <TrendChart data={chartSeries} unit="cm" />
      </div>

      {entries.length > 0 && (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table className="bw-table">
              <thead>
                <tr>
                  <th>Date</th>
                  {fields.map((f) => (
                    <th key={f.key}>{f.label}</th>
                  ))}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sortedDesc.map((e) => (
                  <tr key={e.id}>
                    <td>{e.date}</td>
                    {fields.map((f) => (
                      <td key={f.key}>{e[f.key] ?? '—'}</td>
                    ))}
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
        </div>
      )}
    </div>
  );
}

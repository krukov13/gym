import { useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function parseDateUTC(iso) {
  return new Date(`${iso}T00:00:00Z`);
}

function addDays(iso, days) {
  const d = new Date(parseDateUTC(iso).getTime() + days * 86400000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
}

function diffDays(isoA, isoB) {
  return Math.round((parseDateUTC(isoB) - parseDateUTC(isoA)) / 86400000);
}

function buildTrackers(entries) {
  const byName = new Map();
  for (const e of entries) {
    if (!byName.has(e.name)) byName.set(e.name, []);
    byName.get(e.name).push(e);
  }

  const today = todayISO();
  const trackers = [];
  for (const [name, list] of byName) {
    const sorted = [...list].sort((a, b) => (a.date < b.date ? -1 : 1));
    const intervals = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push(diffDays(sorted[i - 1].date, sorted[i].date));
    }
    const avg = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : null;
    const last = sorted[sorted.length - 1].date;
    const daysSinceLast = diffDays(last, today);
    const nextDue = avg != null ? addDays(last, Math.round(avg)) : null;
    const overdueBy = avg != null ? daysSinceLast - avg : null;
    trackers.push({ name, entries: sorted, avg, last, daysSinceLast, nextDue, overdueBy });
  }

  trackers.sort((a, b) => {
    if (a.overdueBy == null && b.overdueBy == null) return a.name.localeCompare(b.name);
    if (a.overdueBy == null) return 1;
    if (b.overdueBy == null) return -1;
    return b.overdueBy - a.overdueBy;
  });
  return trackers;
}

export default function OtherPage() {
  const [entries, setEntries] = useState([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.getCustomLogs().then(setEntries);

  useEffect(() => {
    load();
  }, []);

  const knownNames = useMemo(() => [...new Set(entries.map((e) => e.name))].sort(), [entries]);
  const trackers = useMemo(() => buildTrackers(entries), [entries]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !date) return;
    setSaving(true);
    try {
      await api.addCustomLog({ name: name.trim(), date, notes: notes.trim() || null });
      setNotes('');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const removeEntry = async (id) => {
    await api.deleteCustomLog(id);
    await load();
  };

  return (
    <div>
      <div className="card">
        <form className="field-row" onSubmit={submit}>
          <div className="field">
            <label htmlFor="o-name">What</label>
            <input
              id="o-name"
              list="o-known-names"
              type="text"
              placeholder="e.g. Haircut, Shave, Nails"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <datalist id="o-known-names">
              {knownNames.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <label htmlFor="o-date">Date</label>
            <input id="o-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field" style={{ flex: 1, minWidth: 160 }}>
            <label htmlFor="o-notes">Notes (optional)</label>
            <input
              id="o-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="optional"
            />
          </div>
          <button className="primary-btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Log it'}
          </button>
        </form>
      </div>

      {trackers.length === 0 && <p className="chart-empty">Nothing logged yet.</p>}

      {trackers.map((t) => (
        <div className="card" key={t.name}>
          <div className="exercise-name">{t.name}</div>
          <div className="stat-row" style={{ marginTop: 10 }}>
            <div className="stat-tile">
              <div className="value">{t.avg != null ? `${t.avg.toFixed(1)} days` : '—'}</div>
              <div className="label">Average interval</div>
            </div>
            <div className="stat-tile">
              <div className="value">{t.last}</div>
              <div className="label">Last logged ({t.daysSinceLast}d ago)</div>
            </div>
            <div className="stat-tile">
              <div className={`value ${t.overdueBy != null && t.overdueBy > 0 ? 'delta-down' : ''}`}>
                {t.nextDue ?? '—'}
              </div>
              <div className="label">
                {t.overdueBy != null
                  ? t.overdueBy > 0
                    ? `Overdue by ${t.overdueBy.toFixed(1)}d`
                    : `Due in ${Math.abs(t.overdueBy).toFixed(1)}d`
                  : 'Next due (needs 2+ logs)'}
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table className="bw-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {[...t.entries].reverse().map((e) => (
                  <tr key={e.id}>
                    <td>{e.date}</td>
                    <td>{e.notes || '—'}</td>
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
      ))}
    </div>
  );
}

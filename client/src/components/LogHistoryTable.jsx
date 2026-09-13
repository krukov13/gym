import { useState } from 'react';
import { api } from '../api.js';

function toNullableNumber(value) {
  return value === '' || value == null ? null : Number(value);
}

export default function LogHistoryTable({ exercise, logs, onChange }) {
  const [edits, setEdits] = useState({});
  const [savingId, setSavingId] = useState(null);

  const getValue = (log, field) => (edits[log.id]?.[field] !== undefined ? edits[log.id][field] : log[field] ?? '');

  const setValue = (id, field, value) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const isDirty = (log) => {
    const e = edits[log.id];
    if (!e) return false;
    return Object.entries(e).some(([field, value]) => String(log[field] ?? '') !== String(value));
  };

  const save = async (log) => {
    setSavingId(log.id);
    try {
      await api.updateLog(log.id, {
        weight: toNullableNumber(getValue(log, 'weight')),
        reps: toNullableNumber(getValue(log, 'reps')),
        assist: toNullableNumber(getValue(log, 'assist')),
      });
      setEdits((prev) => {
        const next = { ...prev };
        delete next[log.id];
        return next;
      });
      await onChange();
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (log) => {
    await api.deleteLog(log.id);
    await onChange();
  };

  if (logs.length === 0) {
    return <p className="chart-empty">No logs yet — nothing to edit.</p>;
  }

  const sortedDesc = [...logs].sort((a, b) =>
    a.date === b.date ? b.set_number - a.set_number : a.date < b.date ? 1 : -1
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="bw-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Set</th>
            <th>Weight (kg)</th>
            <th>Reps</th>
            {Boolean(exercise?.track_assist) && <th>Assist (kg)</th>}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedDesc.map((log) => (
            <tr key={log.id}>
              <td>{log.date}</td>
              <td>#{log.set_number}</td>
              <td>
                <input
                  type="number"
                  inputMode="decimal"
                  value={getValue(log, 'weight')}
                  onChange={(e) => setValue(log.id, 'weight', e.target.value)}
                  style={{ width: 72 }}
                />
              </td>
              <td>
                <input
                  type="number"
                  inputMode="numeric"
                  value={getValue(log, 'reps')}
                  onChange={(e) => setValue(log.id, 'reps', e.target.value)}
                  style={{ width: 60 }}
                />
              </td>
              {Boolean(exercise?.track_assist) && (
                <td>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={getValue(log, 'assist')}
                    onChange={(e) => setValue(log.id, 'assist', e.target.value)}
                    style={{ width: 72 }}
                  />
                </td>
              )}
              <td style={{ whiteSpace: 'nowrap' }}>
                {isDirty(log) && (
                  <button
                    className="primary-btn"
                    onClick={() => save(log)}
                    disabled={savingId === log.id}
                    style={{ padding: '4px 10px', fontSize: '0.78rem', marginRight: 6 }}
                  >
                    {savingId === log.id ? 'Saving…' : 'Save'}
                  </button>
                )}
                <button className="icon-btn" onClick={() => remove(log)} aria-label="Delete row">
                  ✕
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

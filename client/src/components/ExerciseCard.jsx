import { useEffect, useState } from 'react';
import { api } from '../api.js';

function emptyRows(count) {
  return Array.from({ length: Math.max(count || 1, 1) }, (_, i) => ({
    id: null,
    set_number: i + 1,
    weight: '',
    reps: '',
    assist: '',
  }));
}

export default function ExerciseCard({ exercise, date }) {
  const [rows, setRows] = useState(() => emptyRows(exercise.target_sets));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.getExerciseLogsForDate(exercise.id, date).then((logs) => {
      if (cancelled) return;
      if (logs.length > 0) {
        setRows(
          logs.map((l) => ({
            id: l.id,
            set_number: l.set_number,
            weight: l.weight ?? '',
            reps: l.reps ?? '',
            assist: l.assist ?? '',
          }))
        );
      } else {
        setRows(emptyRows(exercise.target_sets));
      }
      setSaved(false);
    });
    return () => {
      cancelled = true;
    };
  }, [exercise.id, exercise.target_sets, date]);

  const updateField = (index, field, value) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
    setSaved(false);
  };

  const addRow = () => {
    setRows((prev) => [...prev, { id: null, set_number: prev.length + 1, weight: '', reps: '', assist: '' }]);
  };

  const removeRow = async (index) => {
    const row = rows[index];
    if (row.id) {
      await api.deleteLog(row.id);
    }
    setRows((prev) => prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, set_number: i + 1 })));
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = [];
      for (const row of rows) {
        if (row.weight === '' && row.reps === '' && row.assist === '') {
          updated.push(row);
          continue;
        }
        const payload = {
          exercise_id: exercise.id,
          date,
          set_number: row.set_number,
          weight: row.weight === '' ? null : Number(row.weight),
          reps: row.reps === '' ? null : Number(row.reps),
          assist: row.assist === '' ? null : Number(row.assist),
        };
        if (row.id) {
          await api.updateLog(row.id, payload);
          updated.push(row);
        } else {
          const created = await api.createLog(payload);
          updated.push({ ...row, id: created.id });
        }
      }
      setRows(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card">
      <div className="exercise-name">{exercise.name}</div>
      <div className="exercise-target">
        Target: {exercise.target_sets ? `${exercise.target_sets} sets` : ''}
        {exercise.target_reps ? ` × ${exercise.target_reps}` : ''}
      </div>
      {exercise.cue && <div className="exercise-cue">{exercise.cue}</div>}

      {rows.map((row, i) => (
        <div className={`set-row${exercise.track_assist ? ' with-assist' : ''}`} key={i}>
          <span className="set-num">#{row.set_number}</span>
          <div>
            <label>Weight (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              value={row.weight}
              onChange={(e) => updateField(i, 'weight', e.target.value)}
            />
          </div>
          <div>
            <label>Reps</label>
            <input
              type="number"
              inputMode="numeric"
              value={row.reps}
              onChange={(e) => updateField(i, 'reps', e.target.value)}
            />
          </div>
          {exercise.track_assist ? (
            <div>
              <label>Assist (kg)</label>
              <input
                type="number"
                inputMode="decimal"
                value={row.assist}
                onChange={(e) => updateField(i, 'assist', e.target.value)}
              />
            </div>
          ) : (
            <div />
          )}
          <button className="icon-btn" onClick={() => removeRow(i)} title="Remove set" aria-label="Remove set">
            ✕
          </button>
        </div>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
        <button className="add-set-btn" onClick={addRow}>
          + Add set
        </button>
        <button className="primary-btn" onClick={save} disabled={saving} style={{ marginLeft: 'auto' }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saved && <span className="saved-flash">Saved ✓</span>}
      </div>
    </div>
  );
}

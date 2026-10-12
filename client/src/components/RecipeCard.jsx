import { useState } from 'react';
import { api } from '../api.js';

export default function RecipeCard({ recipe, onChange }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(recipe);
  const [saving, setSaving] = useState(false);

  const toggle = () => setExpanded((e) => !e);

  const startEdit = (e) => {
    e.stopPropagation();
    setForm(recipe);
    setEditing(true);
    setExpanded(true);
  };

  const cancelEdit = () => {
    setForm(recipe);
    setEditing(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.updateRecipe(recipe.id, form);
      setEditing(false);
      await onChange();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (e) => {
    e.stopPropagation();
    await api.deleteRecipe(recipe.id);
    await onChange();
  };

  return (
    <div className="card">
      <div className="accordion-header" onClick={toggle}>
        <span className="exercise-name">{recipe.title}</span>
        <span className="accordion-toggle">{expanded ? '−' : '+'}</span>
      </div>

      {expanded && (
        <div className="accordion-body">
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="field">
                <label>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Ingredients (one per line)</label>
                <textarea
                  rows={5}
                  value={form.ingredients ?? ''}
                  onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Instructions (one step per line)</label>
                <textarea
                  rows={6}
                  value={form.instructions ?? ''}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Notes (optional)</label>
                <textarea
                  rows={2}
                  value={form.notes ?? ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="primary-btn" onClick={save} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button className="add-set-btn" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {recipe.ingredients && (
                <>
                  <div className="recipe-section-label">Ingredients</div>
                  <div className="recipe-text">{recipe.ingredients}</div>
                </>
              )}
              {recipe.instructions && (
                <>
                  <div className="recipe-section-label">Instructions</div>
                  <div className="recipe-text">{recipe.instructions}</div>
                </>
              )}
              {recipe.notes && (
                <>
                  <div className="recipe-section-label">Notes</div>
                  <div className="recipe-text">{recipe.notes}</div>
                </>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="icon-btn" onClick={startEdit}>
                  Edit
                </button>
                <button className="icon-btn" onClick={remove}>
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

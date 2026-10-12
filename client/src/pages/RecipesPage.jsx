import { useEffect, useState } from 'react';
import { api } from '../api.js';
import RecipeCard from '../components/RecipeCard.jsx';

const emptyForm = { title: '', ingredients: '', instructions: '', notes: '' };

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.getRecipes().then(setRecipes);

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await api.addRecipe(form);
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="card">
        {showForm ? (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="field">
              <label htmlFor="r-title">Title</label>
              <input
                id="r-title"
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Chicken & Rice Bowl"
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="r-ingredients">Ingredients (one per line)</label>
              <textarea
                id="r-ingredients"
                rows={5}
                value={form.ingredients}
                onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="r-instructions">Instructions (one step per line)</label>
              <textarea
                id="r-instructions"
                rows={6}
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="r-notes">Notes (optional)</label>
              <textarea
                id="r-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="primary-btn" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Add recipe'}
              </button>
              <button
                type="button"
                className="add-set-btn"
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button className="primary-btn" onClick={() => setShowForm(true)}>
            + Add recipe
          </button>
        )}
      </div>

      {recipes.length === 0 && <p className="chart-empty">No recipes yet — add your first one above.</p>}

      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} onChange={load} />
      ))}
    </div>
  );
}

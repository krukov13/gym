const db = require('./db');

// Idempotent: inserts a recipe only if no recipe with that exact title
// already exists, so re-running on every boot never creates duplicates and
// never overwrites a recipe the user has since edited.
function seedRecipeIfMissing(recipe) {
  const existing = db.prepare('SELECT id FROM recipes WHERE title = ?').get(recipe.title);
  if (existing) return;
  db.prepare('INSERT INTO recipes (title, ingredients, instructions, notes) VALUES (?, ?, ?, ?)').run(
    recipe.title,
    recipe.ingredients ?? null,
    recipe.instructions ?? null,
    recipe.notes ?? null
  );
}

module.exports = { seedRecipeIfMissing };

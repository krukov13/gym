// Recipes seeded into the database if not already present (matched by
// title). Add more entries here the same way when given a new recipe.
const INITIAL_RECIPES = [
  {
    title: 'Juicy Oven-Baked Chicken Breast (Batch Prep)',
    ingredients: [
      '1 kg to 1.2 kg raw chicken breast fillets (approx. 4-5 large pieces)',
      '1.5 tbsp (20 ml) olive oil',
      '1 tbsp fresh lemon juice (or apple cider vinegar)',
      '1 tsp Dijon mustard',
      '1.5 tsp smoked paprika',
      '1 tsp garlic powder',
      '1 tsp onion powder',
      '1 tsp dried oregano or thyme',
      '1 tsp fine sea salt',
      '0.5 tsp cracked black pepper',
    ].join('\n'),
    instructions: [
      'Even out the thickness: place fillets between parchment/cling wrap and pound the thick end until each is an even 2-2.5cm (~1") thick, so the center and edges finish cooking at the same time.',
      'Preheat oven to 200°C (390°F) conventional, or 190°C (375°F) fan/convection.',
      'Pat chicken dry. Whisk olive oil, lemon juice, Dijon mustard, smoked paprika, garlic powder, onion powder, oregano, salt, and pepper into a paste, then rub evenly over all breasts.',
      'Line a baking sheet with parchment, arrange chicken in a single layer with space between pieces, and bake 18-20 minutes — pull as soon as the thickest part hits 74°C (165°F) internal.',
      'Tent loosely with foil and rest 8-10 minutes before slicing, so the juices redistribute instead of spilling out onto the board.',
    ].join('\n'),
    notes: [
      'Yield: ~4-5 servings (130-150g cooked each). Prep 10 min, bake 18-20 min.',
      'Fridge: slice/cube once cooled to room temp, seal in airtight containers — keeps 4 days.',
      'Reheat: sprinkle 1 tsp water or lemon juice, cover loosely, microwave at 50-60% power for 60-90 sec. Also good cold over rice, potatoes, or greens.',
      'Macros per 150g cooked: ~205-215 kcal, ~36-38g protein, ~0g carbs, ~5-6g fat.',
    ].join('\n'),
  },
];

module.exports = { INITIAL_RECIPES };

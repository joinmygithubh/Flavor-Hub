/**
 * One-off generator: pulls real dishes (with real, matching photos) from the free
 * TheMealDB API and writes them to ../src/seed/dishes.extra.data.js.
 *
 * Run once with:  node scripts/genDishes.mjs
 * The output file is what ships in the repo — this script is not needed at runtime.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dishesData } from '../src/seed/dishes.data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Map our app cuisines -> TheMealDB "areas" to source dishes from, and how many.
const CUISINE_SOURCES = {
  Italian: { areas: ['Italian'], take: 6 },
  Indian: { areas: ['Indian'], take: 6 },
  Chinese: { areas: ['Chinese'], take: 6 },
  Mexican: { areas: ['Mexican'], take: 6 },
  Thai: { areas: ['Thai'], take: 5 },
  Japanese: { areas: ['Japanese'], take: 5 },
  Lebanese: { areas: ['Lebanese'], take: 5 },
  African: { areas: ['Moroccan', 'Egyptian', 'Tunisian', 'Kenyan'], take: 6 },
  Continental: { areas: ['French', 'British', 'Greek'], take: 6 },
  'Fast Food': { areas: ['American'], take: 5 },
};

// Deterministic hash so generated prices/ratings are stable across runs.
const hash = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const PRICE_RANGE = {
  Italian: [11, 17], Indian: [9, 15], Chinese: [9, 14], Mexican: [9, 14],
  Thai: [9, 15], Japanese: [11, 18], Lebanese: [8, 14], African: [9, 15],
  Continental: [12, 20], 'Fast Food': [5, 11],
};

const VEG_HINTS = ['veg', 'paneer', 'salad', 'spinach', 'lentil', 'bean', 'chickpea',
  'mushroom', 'tofu', 'dal', 'aloo', 'falafel', 'hummus', 'ricotta', 'potato',
  'pudding', 'cake', 'tart', 'pie', 'rice', 'cheese', 'fruit', 'tabbouleh'];
const NONVEG_HINTS = ['chicken', 'beef', 'pork', 'lamb', 'fish', 'prawn', 'salmon',
  'shrimp', 'meat', 'duck', 'bacon', 'egg', 'tuna', 'seafood', 'mutton'];

const guessVeg = (name) => {
  const n = name.toLowerCase();
  if (NONVEG_HINTS.some((w) => n.includes(w))) return false;
  if (VEG_HINTS.some((w) => n.includes(w))) return true;
  return false;
};

const deriveTags = (name, cuisine) => {
  const n = name.toLowerCase();
  const tags = new Set([cuisine.toLowerCase()]);
  const map = {
    spicy: ['chilli', 'spicy', 'curry', 'pepper'],
    dessert: ['cake', 'pudding', 'tart', 'pie', 'ice', 'sweet', 'budino', 'baklava'],
    seafood: ['fish', 'prawn', 'salmon', 'shrimp', 'tuna', 'seafood'],
    grilled: ['grill', 'bbq', 'kebab', 'kofta', 'skewer'],
    noodles: ['noodle', 'ramen', 'pasta', 'linguine', 'spaghetti', 'fettuccine'],
    soup: ['soup', 'broth'],
    rice: ['rice', 'biryani', 'risotto'],
  };
  for (const [tag, words] of Object.entries(map)) {
    if (words.some((w) => n.includes(w))) tags.add(tag);
  }
  return [...tags];
};

const pick = (val, [min, max]) => min + (val % (max - min + 1));

// Build a catalogue entry from a TheMealDB meal, assigned to one of our cuisines.
const toEntry = (m, cuisine) => {
  const name = m.strMeal.trim();
  const h = hash(m.idMeal + name);
  const price = pick(h, PRICE_RANGE[cuisine]) + (h % 2 === 0 ? 0.5 : 0);
  const rating = (4.2 + (h % 8) / 10).toFixed(1);
  const prepTime = 15 + (h % 7) * 5; // 15..45
  return {
    name,
    cuisine,
    description: `An authentic ${m.area} favorite. ${name} is freshly prepared with traditional ingredients and delivered hot.`,
    price: Number(price.toFixed(2)),
    image: m.strMealThumb, // real, matching HD photo
    rating: Number(rating),
    isVeg: guessVeg(name),
    prepTime,
    tags: deriveTags(name, cuisine),
  };
};

const fetchArea = async (area) => {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`);
  const json = await res.json();
  return (json.meals || []).map((m) => ({ ...m, area }));
};

// Free-tier "filter by area" is gated for a few cuisines (Indian, Lebanese,
// American), but "search by name" still returns real dishes + matching photos.
// We curate candidate names per cuisine and keep whichever resolve.
const SEARCH_SOURCES = {
  Indian: ['Lamb Biryani', 'Lamb Rogan josh', 'Chicken Handi', 'Dal fry', 'Tandoori chicken', 'Chicken Tikka Masala', 'Lamb tikka', 'Beef Madras'],
  Lebanese: ['Shawarma', 'Falafel', 'Hummus', 'Shakshuka', 'Fattoush', 'Manakish', 'Kibbeh'],
  'Fast Food': ['kofta burgers', 'Kentucky Fried Chicken', 'BBQ Pork Sloppy Joes', 'Chicken Fajita Mac and Cheese', 'Pizza', 'French Fries', 'Hot Dog', 'Beef Burger'],
};

const fetchSearch = async (name) => {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(name)}`);
  const json = await res.json();
  const m = (json.meals || [])[0];
  return m ? { ...m, area: m.strArea || 'International' } : null;
};

const main = async () => {
  // Names already in the base catalogue (avoid duplicates).
  const existing = new Set(dishesData.map((d) => d.name.toLowerCase()));
  const out = [];

  for (const [cuisine, { areas, take }] of Object.entries(CUISINE_SOURCES)) {
    let meals = [];
    for (const area of areas) {
      // eslint-disable-next-line no-await-in-loop
      meals = meals.concat(await fetchArea(area));
    }
    // Stable order by id, then filter dupes, then take N.
    meals.sort((a, b) => Number(a.idMeal) - Number(b.idMeal));
    let added = 0;
    for (const m of meals) {
      if (added >= take) break;
      const name = m.strMeal.trim();
      if (existing.has(name.toLowerCase())) continue;
      existing.add(name.toLowerCase());
      out.push(toEntry(m, cuisine));
      added += 1;
    }
    console.log(`[gen] ${cuisine} (area): +${added}`); // eslint-disable-line no-console
  }

  // --- Pass 2: search-by-name for cuisines whose area listing is gated ---
  for (const [cuisine, names] of Object.entries(SEARCH_SOURCES)) {
    let added = 0;
    for (const name of names) {
      // eslint-disable-next-line no-await-in-loop
      const m = await fetchSearch(name);
      if (!m || !m.strMealThumb) continue;
      const real = m.strMeal.trim();
      if (existing.has(real.toLowerCase())) continue;
      existing.add(real.toLowerCase());
      out.push(toEntry(m, cuisine));
      added += 1;
    }
    console.log(`[gen] ${cuisine} (search): +${added}`); // eslint-disable-line no-console
  }

  const header = `/**
 * Additional dishes sourced from TheMealDB (https://www.themealdb.com) — a free,
 * open meal database. Each entry uses a REAL, high-quality photo that matches the
 * dish (the \`image\` URL is stored in the DB, no binary uploads), keeping the
 * catalogue visually rich across all cuisines. Generated by scripts/genDishes.mjs.
 */
export const extraDishesData = ${JSON.stringify(out, null, 2)};
`;
  const target = path.resolve(__dirname, '../src/seed/dishes.extra.data.js');
  fs.writeFileSync(target, header);
  console.log(`[gen] Wrote ${out.length} dishes to ${target}`); // eslint-disable-line no-console
};

main().catch((e) => {
  console.error(e); // eslint-disable-line no-console
  process.exit(1);
});

# Cook/Book

A static, minimalist cookbook site. No build step, no framework — plain HTML/CSS/JS
served statically (dev: `python -m http.server 8123`, configured in .claude/launch.json).

## Design system — "Homestead Contrast"

- Warm paper `#F4EFE3` ground, espresso `#221B12` ink, rust `#A04F24` accent, warm `#DDD2BC` rules.
  (Rethemed from the original near-black "Contrast" at the user's request — same bold type, warm homestead palette.)
- Homepage renders recipes as photo cards grouped into courses (Mains / Sides & Breads /
  Sweets & Baking / Sauces & Snacks) — grouping derived from tags in `groupOf()` in js/site.js.
- Shopping list is unit-aware: `parseIngredient()` normalizes names and units, sums across
  cups/tbsp/tsp and lb/oz, and groups by store aisle (`AISLES` regexes). Keep ingredient lines
  in the "qty unit name, prep-note" shape so parsing keeps working.
- Fonts: Archivo (900 display, uppercase, tight tracking) + Space Grotesk (text). Loaded from Google Fonts.
- All tokens live in `css/style.css` `:root`. Never hardcode colors in pages.
- Print: every recipe page prints as a light-mode black-on-white recipe card
  (handled globally by the `@media print` block in style.css — no per-page work needed).
- The chosen system came from `design-explorations/index.html` (system 03); other explorations kept for reference.

## Adding a recipe (the recurring task)

1. Copy the structure of `recipes/midnight-chili-oil-noodles.html` — it is the canonical template.
2. Slug: kebab-case filename in `recipes/`. Title case the visible title.
3. Register it in `js/recipes.js` (`num` = next integer; newest first in the array is not required — JS sorts by num desc). That entry powers the homepage index, hero, search, and tag chips.
4. Update in the page itself: `<title>`, JSON-LD block, kicker (`Recipe NNN / primary-tag`), display title (2–3 lines, middle line gets `<span class="outline">`), meta blocks (time / servings with `id="serves-val" data-base` / effort dots ●○○–●●●), intro paragraph, ingredients, steps, footer tag links.
5. Ingredients: scalable numeric quantities wrap in `<span class="qty" data-base="N">N</span>`;
   non-scalable lines ("salt", "to finish") get no qty span. Use US household units:
   cups / tbsp / tsp for volume, lb / oz for weight (e.g. `data-base="0.5"` displaying `½` cup —
   the scaler renders unicode fractions incl. thirds and eighths, see `fmt()` in js/site.js).
   Group long lists with `<li class="subhead">For the sauce</li>` rows.
6. Steps: `<li><div class="num">01</div><p>…</p></li>`, bold key phrases with `<strong>`.
7. Tags: lowercase kebab, reuse existing tags before inventing new ones. The vocabulary
   lives in `js/recipes.js` — check it first. Current vocabulary (by kind):
   - pace: `weeknight`, `15-minute`, `30-minute`, `slow`, `one-pot`
   - kind: `dessert`, `baking`, `bread`, `side`, `soup`, `salad`, `sauce`, `snack`,
     `candy`, `breakfast`, `sandwich`, `burger`, `pizza`, `pasta`, `noodles`
   - protein/diet: `beef`, `chicken`, `vegetarian`, `high-protein`
   - character: `spicy`, `takeout`, `grill`, `vintage`, `holiday`
   - cuisine: `korean`, `japanese`, `italian`, `mexican`, `tex-mex`, `moroccan`, `polish`
   The homepage chip bar shows the top 12 by usage with a "+N more" expander, so
   singleton tags are fine — they surface via search, the expander, and page tag links.
8. Hero image: put the photo at `images/<slug>.jpg` and use
   `<img class="hero-img" src="../images/<slug>.jpg" alt="…">`; if no photo exists yet,
   use the placeholder `<div class="ph hero-img"></div>`. In the registry, set `img: 1`
   only when the jpg exists, and always set an `emoji` — the homepage index shows the
   photo as a 76px thumbnail when `img: 1`, else a dark tile with the emoji.

## Shopping list

`shopping-list.html` + localStorage. Recipe pages need NO markup for it — site.js injects
the "+ Shopping list" button into `.recipe-foot .actions` and a "List (n)" masthead link
on every page. Adding captures ingredient lines at the current scaler setting; the list
page merges lines whose text (after the quantity) matches, summing quantities, and prints
via the global print stylesheet. Don't rename `.recipe-foot .actions`, `.ingredients`,
or `.qty[data-base]` — the injection and parsing depend on them.

## Voice

Recipe intros and steps are terse, confident, second-person, lightly wry — see the
noodles page. No life-story preamble; 1–3 sentence intro max.

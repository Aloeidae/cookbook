// ============================================================
// COOK/BOOK site behavior
//  - homepage: render index, search, tag filtering (?tag= aware)
//  - recipe pages: servings scaler, print button
// ============================================================

const EFFORT = { 1: "●○○", 2: "●●○", 3: "●●●" };
const pad = n => String(n).padStart(3, "0");

/* ---------------- Homepage index ---------------- */
function initIndex() {
  const list = document.getElementById("recipe-index");
  if (!list || typeof RECIPES === "undefined") return;

  const searchEl = document.getElementById("search");
  const chipsEl = document.getElementById("tag-chips");
  const heroEl = document.getElementById("home-hero");

  // Hero = newest recipe, type + photo
  const newest = [...RECIPES].sort((a, b) => b.num - a.num)[0];
  if (heroEl && newest) {
    heroEl.innerHTML = `
      <div class="hero-grid">
        <div>
          <div class="kicker">Latest — Recipe ${pad(newest.num)}</div>
          <a class="display" href="recipes/${newest.slug}.html">${heroTitle(newest.title)}</a>
          <div class="meta">
            <div><b>${newest.time}</b>start to finish</div>
            <div><b>${newest.serves}</b>servings</div>
            <div><b>${EFFORT[newest.effort]}</b>effort</div>
          </div>
        </div>
        <a class="hero-photo" href="recipes/${newest.slug}.html">${newest.img
          ? `<img src="images/${newest.slug}.jpg" alt="">`
          : `<div class="tile">${newest.emoji || "🍽️"}</div>`}</a>
      </div>`;
  }

  // Tag chips from all tags, by frequency
  const counts = {};
  RECIPES.forEach(r => r.tags.forEach(t => counts[t] = (counts[t] || 0) + 1));
  const allTags = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

  let activeTag = new URLSearchParams(location.search).get("tag");
  if (activeTag && !allTags.includes(activeTag)) activeTag = null;

  // show the most-used tags; tuck the long tail behind a "+ more" chip
  const TOP = 12;
  const topTags = allTags.slice(0, TOP);
  const restTags = allTags.slice(TOP);
  let expanded = activeTag !== null && restTags.includes(activeTag);

  function chip(t) {
    return `<button class="tag${t === activeTag ? " on" : ""}" data-tag="${t}">${t}</button>`;
  }
  function renderChips() {
    chipsEl.innerHTML =
      `<button class="tag${!activeTag ? " on" : ""}" data-tag="">All</button>` +
      topTags.map(chip).join("") +
      (expanded ? restTags.map(chip).join("") : "") +
      (restTags.length
        ? `<button class="tag" data-more>${expanded ? "− less" : `+${restTags.length} more`}</button>`
        : "");
  }

  chipsEl.addEventListener("click", e => {
    const more = e.target.closest("button[data-more]");
    if (more) { expanded = !expanded; renderChips(); return; }
    const btn = e.target.closest("button[data-tag]");
    if (!btn) return;
    activeTag = btn.dataset.tag || null;
    const url = activeTag ? `?tag=${encodeURIComponent(activeTag)}` : location.pathname;
    history.replaceState(null, "", url);
    renderChips();
    render();
  });

  searchEl.addEventListener("input", render);
  renderChips();

  // course grouping keeps the shelf organized
  const GROUP_ORDER = ["Mains", "Sides & Breads", "Sweets & Baking", "Sauces & Snacks"];
  function groupOf(r) {
    const t = r.tags;
    if (t.includes("sauce") || t.includes("snack")) return "Sauces & Snacks";
    if (t.includes("dessert") || t.includes("candy")) return "Sweets & Baking";
    if (t.includes("bread") || t.includes("side") || t.includes("salad")) return "Sides & Breads";
    return "Mains";
  }
  const card = r => `
    <a class="card" href="recipes/${r.slug}.html">
      <div class="card-ph">${r.img
        ? `<img src="images/${r.slug}.jpg" alt="" loading="lazy">`
        : `<div class="tile">${r.emoji || "🍽️"}</div>`}</div>
      <div class="line"><span>No. ${pad(r.num)}</span><span>${r.time}</span></div>
      <h3>${r.title}</h3>
    </a>`;

  function render() {
    const q = searchEl.value.trim().toLowerCase();
    const rows = [...RECIPES]
      .sort((a, b) => b.num - a.num)
      .filter(r => !activeTag || r.tags.includes(activeTag))
      .filter(r => !q || r.title.toLowerCase().includes(q) || r.tags.some(t => t.includes(q)));

    if (!rows.length) {
      list.innerHTML = `<div class="empty">Nothing matches — try another tag or search.</div>`;
      return;
    }
    const byGroup = {};
    rows.forEach(r => (byGroup[groupOf(r)] = byGroup[groupOf(r)] || []).push(r));
    list.innerHTML = GROUP_ORDER
      .filter(g => byGroup[g])
      .map(g => `
        <h2 class="group-h">${g}<span>${byGroup[g].length} recipe${byGroup[g].length > 1 ? "s" : ""}</span></h2>
        <div class="cards">${byGroup[g].map(card).join("")}</div>`)
      .join("");
  }

  render();
}

// Split a long title across lines, middle segment outlined
function heroTitle(title) {
  const words = title.split(" ");
  if (words.length < 3) return title;
  const third = Math.ceil(words.length / 3);
  const a = words.slice(0, third).join(" ");
  const b = words.slice(third, third * 2).join(" ");
  const c = words.slice(third * 2).join(" ");
  return `${a}<br><span class="outline">${b}</span><br>${c}`;
}

/* ---------------- Recipe page ---------------- */
function initRecipe() {
  const scaler = document.querySelector(".scaler");
  let scale = 1;
  if (scaler) {
    const base = {};
    document.querySelectorAll(".qty[data-base]").forEach((el, i) => base[i] = parseFloat(el.dataset.base));
    scaler.addEventListener("click", e => {
      const btn = e.target.closest("button[data-x]");
      if (!btn) return;
      scale = parseFloat(btn.dataset.x);
      scaler.querySelectorAll("button").forEach(b => b.classList.toggle("on", b === btn));
      document.querySelectorAll(".qty[data-base]").forEach((el, i) => {
        el.textContent = fmt(base[i] * scale);
      });
      const servesEl = document.getElementById("serves-val");
      if (servesEl) servesEl.textContent = fmt(parseFloat(servesEl.dataset.base) * scale);
    });
  }

  const printBtn = document.getElementById("print-btn");
  if (printBtn) {
    printBtn.addEventListener("click", () => window.print());

    // print layout preference: columns (default) or vertical stack
    const PRINT_KEY = "cookbook-print-layout";
    let layout = "columns";
    try { layout = localStorage.getItem(PRINT_KEY) || "columns"; } catch {}
    const apply = () => document.body.classList.toggle("print-vertical", layout === "vertical");
    const toggle = document.createElement("button");
    toggle.className = "btn-ghost";
    const label = () => toggle.textContent = layout === "vertical" ? "Layout: vertical" : "Layout: columns";
    toggle.title = "Toggle printed layout between side-by-side columns and a vertical stack";
    toggle.addEventListener("click", () => {
      layout = layout === "vertical" ? "columns" : "vertical";
      try { localStorage.setItem(PRINT_KEY, layout); } catch {}
      apply(); label();
    });
    apply(); label();
    printBtn.after(toggle);
  }

  // "Add to shopping list" — injected so recipe pages need no markup changes
  const actions = document.querySelector(".recipe-foot .actions");
  if (actions && document.querySelector(".ingredients")) {
    const slug = location.pathname.split("/").pop().replace(".html", "");
    const btn = document.createElement("button");
    btn.className = "btn-ghost";
    const onList = () => loadShopList().some(r => r.slug === slug);
    btn.textContent = onList() ? "✓ On the list" : "+ Shopping list";
    btn.addEventListener("click", () => {
      const title = document.title.split("—")[0].replace(/\s+/g, " ").trim();
      const items = [...document.querySelectorAll(".ingredients li")]
        .filter(li => !li.classList.contains("subhead"))
        .map(li => {
          const qtyEl = li.querySelector(".qty[data-base]");
          let text = li.textContent.replace(/\s+/g, " ").trim();
          let qty = null;
          if (qtyEl) {
            qty = parseFloat(qtyEl.dataset.base) * scale;
            text = text.replace(qtyEl.textContent, "").replace(/\s+/g, " ").trim();
          }
          return { qty, text };
        });
      const list = loadShopList().filter(r => r.slug !== slug);
      list.push({ slug, title, scale, items });
      saveShopList(list);
      btn.textContent = "✓ On the list";
      updateNavListCount();
    });
    actions.prepend(btn);
  }
}

/* ---------------- Shopping list ---------------- */
const SHOP_KEY = "cookbook-shopping-list";
const SHOP_DONE_KEY = "cookbook-shopping-checked";

function loadShopList() {
  try { return JSON.parse(localStorage.getItem(SHOP_KEY)) || []; } catch { return []; }
}
function saveShopList(list) {
  try { localStorage.setItem(SHOP_KEY, JSON.stringify(list)); } catch {}
}
function loadShopDone() {
  try { return JSON.parse(localStorage.getItem(SHOP_DONE_KEY)) || {}; } catch { return {}; }
}
function saveShopDone(done) {
  try { localStorage.setItem(SHOP_DONE_KEY, JSON.stringify(done)); } catch {}
}
function rootPrefix() {
  return location.pathname.includes("/recipes/") ? "../" : "";
}

// "List (n)" link in every masthead, injected
function injectNavListLink() {
  const nav = document.querySelector(".masthead nav");
  if (!nav || nav.querySelector("[data-list-link]")) return;
  const a = document.createElement("a");
  a.dataset.listLink = "1";
  a.href = rootPrefix() + "shopping-list.html";
  nav.appendChild(a);
  updateNavListCount();
}
function updateNavListCount() {
  const a = document.querySelector("[data-list-link]");
  if (!a) return;
  const n = loadShopList().length;
  a.textContent = n ? `List (${n})` : "List";
}

/* --- ingredient intelligence: units, totals, aisles --- */
const UNITS = {
  cup: ["cup", "cups"], tbsp: ["tbsp", "tablespoon", "tablespoons"], tsp: ["tsp", "teaspoon", "teaspoons"],
  oz: ["oz", "ounce", "ounces"], lb: ["lb", "lbs", "pound", "pounds"]
};
const UNIT_LOOKUP = {};
for (const [u, names] of Object.entries(UNITS)) names.forEach(n => UNIT_LOOKUP[n] = u);
const VOL_TSP = { cup: 48, tbsp: 3, tsp: 1 };
const FAMILY = u => (u in VOL_TSP) ? "vol" : (u === "oz" || u === "lb") ? "wt" : "count";

function parseIngredient(qty, text) {
  let unit = null, rest = text;
  const m = qty != null && text.match(/^([A-Za-z]+)\s+(.+)$/);
  if (m && UNIT_LOOKUP[m[1].toLowerCase()]) { unit = UNIT_LOOKUP[m[1].toLowerCase()]; rest = m[2]; }
  // normalize the name: drop parentheticals, prep notes, "plus more…" clauses
  const name = rest
    .replace(/\([^)]*\)/g, "")
    .replace(/,\s*(plus|extra|divided|to taste|to serve|to finish|for ).*$/i, "")
    .split(",")[0]
    .replace(/^(melted|softened|cold|warm|hot|chopped|minced|grated|shredded|sliced|diced|crushed|toasted|packed)\s+/i, "")
    .replace(/\s+/g, " ").trim().toLowerCase();
  const family = FAMILY(unit);
  const total = qty == null ? null
    : family === "vol" ? qty * VOL_TSP[unit]
    : family === "wt" ? qty * (unit === "lb" ? 16 : 1)
    : qty;
  return { qty, unit, family, name, raw: text, total, key: family + "|" + name };
}

// render a summed total back into kitchen-friendly units
function totalLabel(it) {
  if (it.total == null) return "";
  const clean = v => { const f = fmt(v); return f.includes(".") ? null : f; };
  if (it.family === "vol") {
    const t = it.total;
    const c = t >= 12 && clean(t / 48);
    if (c) return c + (t / 48 > 1 ? " cups" : " cup");
    if (t >= 48) {
      const whole = Math.floor(t / 48), remT = clean((t - whole * 48) / 3);
      if (remT) return `${whole} cup${whole > 1 ? "s" : ""} + ${remT} tbsp`;
    }
    const tb = t >= 3 && clean(t / 3);
    if (tb) return tb + " tbsp";
    if (t >= 3) {
      const whole = Math.floor(t / 3), rem = clean(t - whole * 3);
      if (rem) return `${whole} tbsp + ${rem} tsp`;
    }
    return (clean(t) || (+t.toFixed(2))) + " tsp";
  }
  if (it.family === "wt") {
    const o = it.total;
    const l = o >= 16 && clean(o / 16);
    if (l) return l + " lb";
    if (o >= 16) {
      const whole = Math.floor(o / 16), rem = clean(o - whole * 16);
      if (rem) return `${whole} lb + ${rem} oz`;
    }
    return (clean(o) || (+o.toFixed(1))) + " oz";
  }
  return fmt(it.total);
}

// store-aisle classification, checked in order (specific before generic)
const AISLES = [
  ["Pantry", /broth|stock|noodle|pasta|macaroni|cavatappi|fettuccine|penne|orzo|\brice\b|flour|sugar|\boil\b|vinegar|soy sauce|cornstarch|corn starch|baking powder|baking soda|yeast|honey|syrup|molasses|chocolate|cocoa|marshmallow|peanut butter|gochujang|chili crisp|sesame|jell-?o|gelatin|graham|pretzel|panko|cornflake|breadcrumb|evaporated milk|condensed|shaoxing|mirin|\bwine\b|sherry|bean|chickpea|lentil|tortilla|\bbun\b|\bbread\b|pudding mix|protein|whey|sweetener|date|hazelnut|macadamia|walnut|pecan|raisin|tomato paste|crushed tomato|canned|mayo|mayonnaise|ketchup|bbq sauce|mustard|corn syrup|food coloring|sprinkles|cookie dough|brownie mix|ice cream|popcorn|crackers|chips/],
  ["Spices & Seasoning", /garlic powder|onion powder|paprika|cajun|chili powder|cayenne|cumin|coriander|turmeric|oregano|thyme|rosemary|cinnamon|nutmeg|ground cloves?|whole cloves?|pumpkin pie spice|star anise|peppercorn|bay lea|salt\b|black pepper|white pepper|pepper flakes|gochugaru|citric acid|cream of tartar|seasoning|vanilla|five spice|msg/],
  ["Dairy & Eggs", /\bmilk\b|butter|cream cheese|heavy cream|\bcream\b|cheese|\begg|yogurt|buttermilk|cool whip|parmesan|mozzarella|cheddar|american|half-and-half/],
  ["Meat & Seafood", /beef|brisket|chuck|chicken|pork|bacon|sausage|steak|\brib|lamb|turkey|pepperoni|shrimp|fish/],
  ["Produce", /onion|scallion|garlic|ginger|potato|tomato|lettuce|parsley|cilantro|basil|celery|carrot|mushroom|sprout|cabbage|pepper|jalape|lemon|lime|orange|blueberr|strawberr|\bcorn\b|leek|herb|avocado|cucumber|apple|banana|gosari|fernbrake/],
];
const AISLE_ORDER = ["Produce", "Meat & Seafood", "Dairy & Eggs", "Pantry", "Spices & Seasoning", "Everything Else"];
function aisleOf(it) {
  const hay = it.name || "";
  for (const [aisle, re] of AISLES) if (re.test(hay)) return aisle;
  return "Everything Else";
}

// shopping-list.html renderer
function initShopping() {
  const itemsEl = document.getElementById("shop-items");
  if (!itemsEl) return;
  const recipesEl = document.getElementById("shop-recipes");
  const emptyEl = document.getElementById("shop-empty");

  document.getElementById("shop-print").addEventListener("click", () => window.print());
  document.getElementById("shop-clear").addEventListener("click", () => {
    saveShopList([]); saveShopDone({}); render(); updateNavListCount();
  });

  recipesEl.addEventListener("click", e => {
    const x = e.target.closest("button[data-remove]");
    if (!x) return;
    saveShopList(loadShopList().filter(r => r.slug !== x.dataset.remove));
    render(); updateNavListCount();
  });

  itemsEl.addEventListener("change", e => {
    const cb = e.target.closest("input[data-key]");
    if (!cb) return;
    const done = loadShopDone();
    if (cb.checked) done[cb.dataset.key] = 1; else delete done[cb.dataset.key];
    saveShopDone(done);
  });

  function render() {
    const list = loadShopList();
    const done = loadShopDone();

    document.getElementById("shop-recipe-count").textContent = list.length;
    emptyEl.hidden = list.length > 0;

    recipesEl.innerHTML = list.map(r => `
      <span class="rtag">
        <a href="recipes/${r.slug}.html">${r.title}</a>${r.scale !== 1 ? ` <em>at ${fmt(r.scale)}×</em>` : ""}
        <button data-remove="${r.slug}" title="Remove">×</button>
      </span>`).join("");

    // smart merge: same ingredient across recipes sums into one usable total,
    // converting across cups/tbsp/tsp and lb/oz
    const merged = new Map();
    for (const r of list) {
      for (const it of r.items) {
        const p = parseIngredient(it.qty, it.text);
        const prev = merged.get(p.key);
        if (prev) {
          if (prev.total != null && p.total != null) prev.total += p.total;
          else prev.total = prev.total ?? p.total;
          prev.from.push(r.title);
        } else {
          merged.set(p.key, { ...p, from: [r.title] });
        }
      }
    }
    const rows = [...merged.values()];
    document.getElementById("shop-item-count").textContent = rows.length;

    // group by store aisle
    const byAisle = {};
    rows.forEach(it => (byAisle[aisleOf(it)] = byAisle[aisleOf(it)] || []).push(it));
    itemsEl.innerHTML = AISLE_ORDER
      .filter(a => byAisle[a])
      .map(a => `<li class="subhead">${a}</li>` +
        byAisle[a].sort((x, y) => x.name.localeCompare(y.name)).map(it => {
          const label = it.from.length > 1
            ? `${totalLabel(it)} ${it.name} <span class="from">× ${it.from.length} recipes</span>`
            : `${it.qty != null ? fmt(it.qty) + " " : ""}${it.raw}`;
          return `<li><label><input type="checkbox" data-key="${it.key}"${done[it.key] ? " checked" : ""}><span>${label}</span></label></li>`;
        }).join(""))
      .join("");
  }

  render();
}

function fmt(n) {
  if (Number.isInteger(n)) return String(n);
  const whole = Math.floor(n);
  const rest = n - whole;
  const fracs = [
    [0.125, "⅛"], [1 / 6, "⅙"], [0.25, "¼"], [1 / 3, "⅓"], [0.375, "⅜"], [0.5, "½"],
    [0.625, "⅝"], [2 / 3, "⅔"], [0.75, "¾"], [0.875, "⅞"]
  ];
  for (const [v, ch] of fracs) {
    if (Math.abs(rest - v) < 0.02) return whole ? whole + ch : ch;
  }
  return String(+n.toFixed(2));
}

document.addEventListener("DOMContentLoaded", () => {
  initIndex();
  initRecipe();
  initShopping();
  injectNavListLink();
});

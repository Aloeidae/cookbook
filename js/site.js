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

  // Hero = newest recipe
  const newest = [...RECIPES].sort((a, b) => b.num - a.num)[0];
  if (heroEl && newest) {
    heroEl.innerHTML = `
      <div class="kicker">Recipe ${pad(newest.num)} / ${newest.tags[0]}</div>
      <a class="display" href="recipes/${newest.slug}.html">${heroTitle(newest.title)}</a>
      <div class="meta">
        <div><b>${newest.time}</b>start to finish</div>
        <div><b>${newest.serves}</b>servings</div>
        <div><b>${EFFORT[newest.effort]}</b>effort</div>
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
    list.innerHTML = rows.map(r => `
      <a class="row" href="recipes/${r.slug}.html">
        <div class="idx">${pad(r.num)}</div>
        ${r.img
          ? `<img class="thumb" src="images/${r.slug}.jpg" alt="" loading="lazy">`
          : `<div class="thumb tile">${r.emoji || "🍽️"}</div>`}
        <h3>${r.title}</h3>
        <div class="tags">${r.tags.slice(0, 2).map(t => `<span class="tag">${t}</span>`).join("")}</div>
        <div class="time">${r.time}</div>
      </a>`).join("");
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
  if (printBtn) printBtn.addEventListener("click", () => window.print());

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

    // merge identical lines (same text after the quantity), summing quantities
    const merged = new Map();
    for (const r of list) {
      for (const it of r.items) {
        const key = it.text.toLowerCase();
        const prev = merged.get(key);
        if (prev) {
          if (prev.qty != null && it.qty != null) prev.qty += it.qty;
          else if (it.qty != null) prev.qty = it.qty;
          prev.from.push(r.title);
        } else {
          merged.set(key, { qty: it.qty, text: it.text, from: [r.title] });
        }
      }
    }
    const rows = [...merged.values()].sort((a, b) => a.text.localeCompare(b.text));
    document.getElementById("shop-item-count").textContent = rows.length;

    itemsEl.innerHTML = rows.map(it => {
      const key = it.text.toLowerCase();
      const label = (it.qty != null ? fmt(it.qty) + " " : "") + it.text;
      const multi = it.from.length > 1 ? ` <span class="from">× ${it.from.length} recipes</span>` : "";
      return `<li><label><input type="checkbox" data-key="${key}"${done[key] ? " checked" : ""}><span>${label}${multi}</span></label></li>`;
    }).join("");
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

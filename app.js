/* Ruthmann Shoe Collection — simple static SPA
   - Data: shoes.json
   - Search: Fuse.js
   - Styling: Tailwind CDN
*/

const state = {
  items: [],
  filtered: [],
  fuse: null,
  q: "",
  collection: "all",
  brand: "all",
  type: "all",
  tag: "all"
};

const el = (id) => document.getElementById(id);

function uniqSorted(arr) {
  return Array.from(new Set(arr.filter(Boolean).map(String))).sort((a,b)=>a.localeCompare(b));
}

function fmt(v) {
  if (v === null || v === undefined || v === "" || (typeof v === "number" && Number.isNaN(v))) return "—";
  return String(v);
}

function firstPhoto(item) {
  return item.photos?.[0]?.url || null;
}

function card(item) {
  const thumb = firstPhoto(item);
  const sub = [item.brand, item.type, item.color].filter(Boolean).join(" • ");

  return `
    <button class="text-left rounded-2xl border border-zinc-200 bg-white hover:shadow-sm transition p-3 flex gap-3" data-open="${item.id}">
      <div class="w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center text-xs text-zinc-500 shrink-0">
        ${thumb ? `<img src="${thumb}" alt="" class="w-full h-full object-cover">` : "No photo"}
      </div>
      <div class="min-w-0">
        <div class="font-semibold leading-snug line-clamp-2">${fmt(item.label)}</div>
        <div class="text-xs text-zinc-600 mt-1 line-clamp-2">${sub || "—"}</div>
        <div class="text-xs text-zinc-500 mt-1 line-clamp-1">${[item.last, item.size, item.sole].filter(Boolean).join(" • ")}</div>
      </div>
    </button>
  `;
}

function renderList(items) {
  el("count").textContent = items.length;
  el("grid").innerHTML = items.map(card).join("");
}

function applyFilters() {
  let items = state.items;

  if (state.collection !== "all") items = items.filter(x => x.collection === state.collection);
  if (state.brand !== "all") items = items.filter(x => (x.brand || "").toLowerCase() === state.brand.toLowerCase());
  if (state.type !== "all") items = items.filter(x => (x.type || "").toLowerCase() === state.type.toLowerCase());
  if (state.tag !== "all") items = items.filter(x => (x.tags || []).map(t => String(t).toLowerCase()).includes(state.tag.toLowerCase()));

  if (state.q.trim()) {
    const results = state.fuse.search(state.q.trim());
    const byId = new Map(results.map(r => [r.item.id, r.item]));
    items = items.filter(i => byId.has(i.id));
    // keep Fuse ranking
    items = results.map(r => r.item).filter(i => items.some(x => x.id === i.id));
  }

  state.filtered = items;
  renderList(items);
}

function populateFacets() {
  const brands = uniqSorted(state.items.map(x => x.brand));
  const types = uniqSorted(state.items.map(x => x.type));
  const tags  = uniqSorted(state.items.flatMap(x => (x.tags || [])));

  const brandSel = el("brand");
  const typeSel  = el("type");
  const tagSel   = el("tag");

  for (const b of brands) brandSel.insertAdjacentHTML("beforeend", `<option value="${b}">${b}</option>`);
  for (const t of types)  typeSel.insertAdjacentHTML("beforeend", `<option value="${t}">${t}</option>`);
  for (const g of tags)   tagSel.insertAdjacentHTML("beforeend", `<option value="${g}">${g}</option>`);
}

function setHero(url) {
  const hero = el("mHero");
  if (!url) {
    hero.innerHTML = "No photo yet (add images to /photos and update shoes.json)";
    hero.className = hero.className.replace(/bg-[^ ]+/g, "") + " bg-zinc-100";
    return;
  }
  hero.innerHTML = `<img src="${url}" alt="" class="w-full h-full object-cover rounded-2xl">`;
}

function openModal(item) {
  el("mTitle").textContent = fmt(item.label);
  el("mSub").textContent = [item.brand, item.model].filter(Boolean).join(" — ") || "—";
  el("mStatus").textContent = fmt(item.status);
  el("mUse").textContent = fmt(item.useCase);

  const specs = [
    ["Brand", item.brand],
    ["Type", item.type],
    ["Model", item.model],
    ["Color", item.color],
    ["Material", item.material],
    ["Line", item.line],
    ["Last", item.last],
    ["Size", item.size],
    ["Country", item.country],
    ["Sole", item.sole],
    ["Purchase (RMB)", item.purchasePriceRMB],
    ["Orig. currency", item.origCurrency],
    ["Condition", item.condition],
    ["Collection", item.collection],
    ["Tags", (item.tags || []).join(", ")],
    ["Season", ((item.rotation||{}).season||[]).join(", ")],
    ["Weather", ((item.rotation||{}).weather||[]).join(", ")],
    ["Role", (item.role||{}).collectionRole],
    ["Style axis", ((item.role||{}).styleAxis||[]).join(", ")],
    ["Overlaps", (item.comparison && item.comparison.overlapsWith ? item.comparison.overlapsWith.length : 0)],
    ["Fills gap", (item.comparison||{}).fillsGap]
  ];

  el("mSpecs").innerHTML = specs.map(([k,v]) => `
    <div class="flex justify-between gap-4">
      <dt class="text-zinc-500">${k}</dt>
      <dd class="font-medium text-zinc-800 text-right">${fmt(v)}</dd>
    </div>
  `).join("");

  el("mNotes").textContent = fmt(item.notes);

  const hist = item.history || [];
  el("mHistory").innerHTML = hist.length ? `
    <ul class="space-y-2">
      ${hist.map(h => `<li class="rounded-xl border border-zinc-200 p-2">
        <div class="text-xs text-zinc-500">${fmt(h.date)} • ${fmt(h.event)}</div>
        <div class="text-sm">${fmt(h.notes)}</div>
      </li>`).join("")}
    </ul>
  ` : `<div class="text-zinc-500">—</div>`;

  // gallery
  const photos = item.photos || [];
  el("mGallery").innerHTML = photos.slice(0, 9).map((p, idx) => `
    <button class="rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 aspect-square" data-hero="${p.url}">
      <img src="${p.url}" alt="" class="w-full h-full object-cover">
    </button>
  `).join("");

  setHero(photos[0]?.url || null);

  el("modal").classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
}

function closeModal() {
  el("modal").classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

async function init() {
  const res = await fetch("./shoes.json");
  const data = await res.json();
  state.items = Array.isArray(data) ? data : (data.items || []);
  // Backward-compat: allow shoes.json to be either an array or {items:[...]}
  // Normalize collection field if missing (derive from status)
  state.items = state.items.map(x => ({
    ...x,
    collection: x.collection || (String(x.status||"").toLowerCase().includes("retir") || String(x.status||"").toLowerCase().includes("sell") ? "retired" : "active"),
  }));

  state.fuse = new Fuse(state.items, {
    includeScore: true,
    threshold: 0.35,
    keys: [
      "label","brand","type","model","color","material","line","last","size","country","sole","useCase","notes","tags","role.collectionRole","role.styleAxis","rotation.season","rotation.weather","comparison.fillsGap"
    ]
  });

  populateFacets();
  applyFilters();

  el("q").addEventListener("input", (e) => { state.q = e.target.value; applyFilters(); });
  el("collection").addEventListener("change", (e) => { state.collection = e.target.value; applyFilters(); });
  el("brand").addEventListener("change", (e) => { state.brand = e.target.value; applyFilters(); });
  el("type").addEventListener("change", (e) => { state.type = e.target.value; applyFilters(); });
  el("tag").addEventListener("change", (e) => { state.tag = e.target.value; applyFilters(); });

  el("clear").addEventListener("click", () => {
    state.q = ""; state.collection="all"; state.brand="all"; state.type="all";
    el("q").value=""; el("collection").value="all"; el("brand").value="all"; el("type").value="all";
    applyFilters();
  });

  document.addEventListener("click", (e) => {
    const openId = e.target?.closest?.("[data-open]")?.getAttribute("data-open");
    if (openId) {
      const item = state.items.find(x => x.id === openId);
      if (item) openModal(item);
    }

    if (e.target?.getAttribute?.("data-close")) closeModal();

    const heroUrl = e.target?.closest?.("[data-hero]")?.getAttribute("data-hero");
    if (heroUrl) setHero(heroUrl);
  });

  window.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
}

init();

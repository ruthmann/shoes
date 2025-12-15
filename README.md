# Ruthmann Shoe Collection (Simple Responsive Web UI)

This is a **static**, mobile-friendly catalog UI for your shoe collection.

## What it does
- Responsive grid + detail modal (good on phone + laptop)
- Fast fuzzy search (Fuse.js) across key fields + notes
- Filters: Active/Retired, Brand, Type
- Photo gallery per shoe (multiple perspectives)
- Per-item **notes** + **history timeline** (bought / resole / polish / sell)

## Files
- `index.html` — UI
- `app.js` — search/filter + modal logic
- `shoes.json` — your data (exported from the Excel you attached)
- `/photos` — put images here (optional)

## Add photos (recommended structure)
1. Create `photos/` folder.
2. Put images like:
   - `photos/alden-5165-front.jpg`
   - `photos/alden-5165-side.jpg`
   - `photos/alden-5165-sole.jpg`
3. Edit the matching item in `shoes.json`:
```json
"photos": [
  {"url":"./photos/alden-5165-front.jpg","perspective":"front","caption":"Front 3/4"},
  {"url":"./photos/alden-5165-side.jpg","perspective":"side","caption":"Side"},
  {"url":"./photos/alden-5165-sole.jpg","perspective":"sole","caption":"Sole"}
]
```

## Add history entries
```json
"history": [
  {"date":"2025-12-11","event":"Added to collection","notes":"Bought from XYZ, great fit."},
  {"date":"2026-02-10","event":"Resoled","notes":"JR sole + toe plates."}
]
```

## Run locally
Because this app fetches `shoes.json`, you need a local server (not `file://`).

**Option A (Python):**
```bash
cd shoe_portfolio
python -m http.server 8000
```
Then open http://localhost:8000

**Option B (Node):**
```bash
npx serve .
```

## Deploy (sharing with collectors / makers)
- **GitHub Pages** (free): push this folder to a repo, enable Pages, done.
- **Netlify** or **Vercel**: drag-and-drop / connect repo.

## Next upgrades (if you want)
- Auth + private share links (for makers)
- SQLite/Postgres backend + admin UI for editing
- “Compare mode” (side-by-side spec diff)
- Analytics: brand counts, leather counts, rain-safe list, etc.

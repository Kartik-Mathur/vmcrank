# 🎓 JoSAA 2025 College Predictor

A production-quality React + TypeScript web application that helps JEE candidates predict which IITs, NITs, IIITs, and GFTIs they are likely to get based on their rank — using the official JoSAA 2025 Round 6 final cutoff data.

---

## 🚀 Quick Start

```bash
npm install
npm run dev       # development server at http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview the production build
```

The app auto-loads `public/data/JOSSA-2025.xlsx`. If the Excel fetch fails, it falls back to the pre-processed JSON bundle in `src/data/josaa_data.json`.

---

## 📂 Project Structure

```
src/
├── components/          # All React UI components
│   ├── Header.tsx       # Sticky top bar with bookmarks
│   ├── RankInputForm.tsx# Rank + profile inputs
│   ├── FilterSidebar.tsx# Desktop sidebar / mobile drawer
│   ├── ResultCard.tsx   # Individual result card
│   ├── TableView.tsx    # Sortable table view
│   ├── StatsBar.tsx     # Summary stats + toolbar
│   ├── CompareModal.tsx # Side-by-side comparison modal
│   ├── BookmarksPanel.tsx # Saved colleges slide-over
│   ├── Pagination.tsx   # Page navigation
│   ├── EmptyState.tsx   # No results / welcome screen
│   ├── LoadingScreen.tsx# Data loading splash
│   └── InfoBanner.tsx   # Dismissible tips guide
│
├── store/
│   └── useStore.ts      # Zustand global state (profile, filters, UI)
│
├── hooks/
│   └── useRecommendations.ts  # Memoized results + pagination hook
│
├── utils/
│   ├── parseExcel.ts          # Excel → typed records parser
│   ├── getRecommendations.ts  # Core filtering + ranking engine
│   ├── detectInstituteType.ts # IIT/NIT/IIIT/GFTI detection
│   ├── rankClassifier.ts      # Safe/Target/Ambitious classifier
│   ├── exportCSV.ts           # CSV export utility
│   └── cn.ts                  # Tailwind class helper
│
├── types/index.ts       # All TypeScript types
├── constants/index.ts   # Thresholds, labels, config
└── data/
    └── josaa_data.json  # Pre-processed fallback data (11,944 records)

public/
└── data/
    └── JOSSA-2025.xlsx  # Source data file (place new year's file here)
```

---

## 🧠 How It Works

### 1. Data Loading
On mount, the app tries to fetch `JOSSA-2025.xlsx` from `public/data/`. If that fails (e.g. CORS, missing file), it falls back to the bundled `josaa_data.json`. The Excel parser handles:
- "50P" preparatory rank suffixes (strips the P)
- Comma-separated numbers ("1,234" → 1234)
- Whitespace trimming in all string fields
- Missing / null values → `null` (rows with null closing rank are skipped)

### 2. Institute Type Detection
Each row's institute name is matched against patterns:
- `"Indian Institute of Technology"` → **IIT**
- `"National Institute of Technology"` → **NIT**
- `"Indian Institute of Information Technology" / "IIIT"` → **IIIT**
- Everything else with technology/engineering keywords → **GFTI**

### 3. Rank Matching
```
IITs  → use JEE Advanced rank (CRL)
NITs  → use JEE Main rank (CRL)
IIITs → use JEE Main rank (CRL)
GFTIs → use JEE Main rank (CRL)
```

A program is eligible when: `candidateRank ≤ closingRank × AMBITIOUS_FACTOR`

### 4. Recommendation Labels

| Label     | Condition                                        |
|-----------|--------------------------------------------------|
| Safe      | `candidateRank ≤ closingRank × 0.85`             |
| Target    | `candidateRank ≤ closingRank × 1.00`             |
| Ambitious | `candidateRank ≤ closingRank × 1.08`             |
| Out of Range | `candidateRank > closingRank × 1.08` (hidden) |

These thresholds are fully configurable in `src/constants/index.ts`:
```ts
export const RANK_THRESHOLDS = {
  SAFE_FACTOR: 0.85,
  TARGET_FACTOR: 1.0,
  AMBITIOUS_FACTOR: 1.08,
};
```

### 5. Quota System

| Quota | Meaning              | Applies To          |
|-------|----------------------|---------------------|
| AI    | All India            | IITs (exclusively), some NITs |
| HS    | Home State (50% seats) | NITs, IIITs       |
| OS    | Other State (50% seats) | NITs, IIITs      |
| GO    | Goa State quota      | NIT Goa only        |
| JK    | Jammu & Kashmir      | NIT Srinagar        |
| LA    | Ladakh               | NIT Srinagar        |

**Auto-filter behaviour (when no explicit quota selected):**
- IIT rows → only AI quota shown
- NIT/IIIT/GFTI rows → AI + HS + OS shown; GO/JK/LA excluded unless explicitly filtered

**Home State quota tip:** Select your state in the sidebar. If you add `HS` to quota filters, only your state's Home State rows appear. If you're from another state, select `OS`.

### 6. Gender Pools
- **Gender-Neutral** candidates: see only Gender-Neutral seat rows
- **Female** candidates: see both Gender-Neutral AND Female-only (including Supernumerary) rows — as per JoSAA rules where female candidates are eligible for both pools

### 7. Sorting

**Best Match** (default):
1. Label priority: Safe → Target → Ambitious
2. Lower closing rank first (more competitive / prestigious)
3. Lower opening rank
4. Institute name A–Z

Other sort options: Lowest Closing Rank, Highest Closing Rank, Institute Name A–Z.

---

## 🔄 Updating for a New Year

1. Download the new JoSAA cutoff Excel from [josaa.nic.in](https://josaa.nic.in)
2. Replace `public/data/JOSSA-2025.xlsx` with the new file
3. Update the filename reference in `src/App.tsx` if needed:
   ```ts
   await parseExcelFromUrl('./data/JOSSA-2026.xlsx');
   ```
4. Regenerate the JSON fallback (optional):
   ```bash
   python3 scripts/generate_json.py
   ```
5. The app's column mapping in `parseExcel.ts` handles variations in header names, so it should work with minimal changes.

**Excel column names the parser recognises:**
- `Institute` / `institute`
- `Academic Program Name` / `Program`
- `Quota` / `quota`
- `Seat Type` / `seat_type` / `Category`
- `Gender` / `gender`
- `Opening Rank` / `opening_rank` / `OpeningRank`
- `Closing Rank` / `closing_rank` / `ClosingRank`

---

## ✨ Features

- ✅ 11,944 cutoff records from 128 institutes (23 IIT + 31 NIT + 24 IIIT + 50 GFTI)
- ✅ Smart auto-filtering by category, gender, and institute type
- ✅ Safe / Target / Ambitious classification with rank buffer display
- ✅ Card view and sortable table view
- ✅ Desktop sidebar + mobile filter drawer
- ✅ Bookmark up to 50 programs (persisted in localStorage)
- ✅ Compare up to 3 programs side-by-side
- ✅ Export results or bookmarks to CSV
- ✅ Paginated results (20 per page)
- ✅ Full-text search across institute and program names
- ✅ Excel-first with JSON fallback for offline/fast loading
- ✅ State persisted across sessions via localStorage

---

## ⚠️ Disclaimer

This predictor is for **guidance purposes only**. Actual JoSAA allotments depend on:
- Seat availability in the current round
- Other candidates' choices and ranks
- Document verification outcomes
- Year-to-year variation in cutoffs

Always verify on the official JoSAA website: [josaa.nic.in](https://josaa.nic.in)

---

## 🛠️ Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 5 | Build tool |
| Tailwind CSS | 3 | Styling |
| Zustand | 4 | State management |
| xlsx | 0.18 | Excel parsing |
| lucide-react | 0.446 | Icons |
| Sora (Google Font) | — | Typography |


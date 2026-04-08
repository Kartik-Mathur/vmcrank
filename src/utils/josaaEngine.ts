import type { JosaaRecord, JosaaResult, JosaaProfile, JosaaFilters, InstType, RecLabel, JosaaStats } from '../types';
import { detectInstType } from './detectInstType';
import { JOSAA_THRESHOLDS } from '../constants';

function label(rank: number, closing: number): RecLabel {
  const { SAFE, TARGET, AMBITIOUS } = JOSAA_THRESHOLDS;
  if (rank <= closing * SAFE)      return 'Safe';
  if (rank <= closing * TARGET)    return 'Target';
  if (rank <= closing * AMBITIOUS) return 'Ambitious';
  return 'Out of Range';
}

function score(closing: number) {
  return Math.round(Math.min(100, Math.max(0, 100 - Math.log10(Math.max(1, closing)) * 20)));
}

function matchesInstFilter(t: InstType, f: JosaaFilters['instTypeFilter']): boolean {
  return f === 'ALL' || t === f;
}

function getRank(t: InstType, p: JosaaProfile): number | null {
  return t === 'IIT' ? p.advRank : p.mainRank;
}

export function runJosaa(
  records: JosaaRecord[],
  profile: JosaaProfile,
  filters: JosaaFilters
): JosaaResult[] {
  const out: JosaaResult[] = [];

  for (const rec of records) {
    const instType = detectInstType(rec.institute);

    // institute type gate
    if (!matchesInstFilter(instType, filters.instTypeFilter)) continue;
    // subtype chip
    if (filters.subtypeChips.length > 0 && !filters.subtypeChips.includes(instType)) continue;

    // rank
    const rank = getRank(instType, profile);
    if (!rank) continue;

    // closing rank must exist
    const closing = rec.closingRank;
    if (!closing || closing <= 0) continue;

    // quota: if no filter, IIT→AI only, NIT→AI/HS/OS only
    if (filters.quotas.length > 0) {
      if (!filters.quotas.includes(rec.quota)) continue;
    } else {
      if (instType === 'IIT' && rec.quota !== 'AI') continue;
      if (instType !== 'IIT' && !['AI','HS','OS'].includes(rec.quota)) continue;
    }

    // seat type / category
    if (filters.seatTypes.length > 0) {
      if (!filters.seatTypes.includes(rec.seatType)) continue;
    } else {
      if (profile.category && rec.seatType !== profile.category) continue;
    }

    // gender
    const isFemale = profile.gender.toLowerCase().includes('female');
    const recGender = rec.gender.toLowerCase();
    const isGN = recGender.includes('gender-neutral') || recGender.includes('gender neutral');
    const isFemaleRow = recGender.includes('female');
    if (filters.genders.length === 0) {
      if (isFemale) { if (!isGN && !isFemaleRow) continue; }
      else { if (!isGN) continue; }
    }

    // classify
    const lbl = label(rank, closing);
    if (lbl === 'Out of Range') continue;

    // text search
    if (filters.searchText.trim()) {
      const q = filters.searchText.toLowerCase();
      if (!rec.institute.toLowerCase().includes(q) && !rec.program.toLowerCase().includes(q)) continue;
    }

    out.push({ ...rec, instType, label: lbl, rankGap: closing - rank, score: score(closing), candidateRank: rank });
  }

  return sortJosaa(out, filters.sortBy);
}

function sortJosaa(r: JosaaResult[], by: JosaaFilters['sortBy']): JosaaResult[] {
  const lo: Record<string, number> = { Safe: 0, Target: 1, Ambitious: 2 };
  return [...r].sort((a, b) => {
    if (by === 'lowestClosing') return (a.closingRank ?? 0) - (b.closingRank ?? 0);
    if (by === 'highestClosing') return (b.closingRank ?? 0) - (a.closingRank ?? 0);
    if (by === 'nameAZ') return a.institute.localeCompare(b.institute);
    const ld = (lo[a.label] ?? 9) - (lo[b.label] ?? 9);
    if (ld !== 0) return ld;
    const cd = (a.closingRank ?? 0) - (b.closingRank ?? 0);
    if (cd !== 0) return cd;
    return a.institute.localeCompare(b.institute);
  });
}

export function josaaStats(results: JosaaResult[]): JosaaStats {
  let safe = 0, target = 0, ambitious = 0;
  for (const r of results) {
    if (r.label === 'Safe') safe++;
    else if (r.label === 'Target') target++;
    else if (r.label === 'Ambitious') ambitious++;
  }
  return { total: results.length, safe, target, ambitious };
}

export function getUniqueField(records: JosaaRecord[], field: keyof JosaaRecord): string[] {
  return [...new Set(records.map(r => r[field]).filter((v): v is string => typeof v === 'string' && v !== ''))].sort();
}

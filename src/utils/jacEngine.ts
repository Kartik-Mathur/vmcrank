import type { JacRecord, JacResult, JacProfile, JacFilters, RecLabel, JacStats } from '../types';
import { JAC_THRESHOLDS } from '../constants';

function label(rank: number, closing: number): RecLabel {
  const { SAFE, TARGET, AMBITIOUS } = JAC_THRESHOLDS;
  if (rank <= closing * SAFE)      return 'Safe';
  if (rank <= closing * TARGET)    return 'Target';
  if (rank <= closing * AMBITIOUS) return 'Ambitious';
  return 'Out of Range';
}

function score(closing: number) {
  return Math.round(Math.min(100, Math.max(0, 100 - Math.log10(Math.max(1, closing)) * 20)));
}

/** Normalize reservation group across all 4 files */
function normRes(r: string): string {
  const l = r.toLowerCase();
  if (l.includes('general') || l === 'supernumerary') return 'General';
  if (l.includes('ews')) return 'EWS';
  if (l.includes('obc')) return 'OBC';
  if (l === 'sc' || l.includes('scheduled caste')) return 'SC';
  if (l === 'st' || l.includes('scheduled tribe')) return 'ST';
  if (l.includes('kashmiri')) return 'Special';
  return r;
}

/** Normalize subcategory across all 4 files */
function normSub(s: string): string {
  const l = s.toLowerCase();
  // girl-type
  if (l === 'girl' || l.includes('girl child') || l === 'single girl child') return 'GIRL';
  // neutral / open
  if (l === 'gender neutral' || l === 'no subcategory' || l === 'general' || l === '-') return 'NEUTRAL';
  // defence
  if (l.includes('defence') || l.includes('cw') || l.includes('central worker')) return 'DEFENCE';
  // pwd
  if (l.includes('pwd') || l.includes('persons with disab')) return 'PWD';
  // km
  if (l.includes('kashmiri')) return 'KM';
  return 'NEUTRAL';
}

export function runJac(
  records: JacRecord[],
  profile: JacProfile,
  filters: JacFilters
): JacResult[] {
  const rank = profile.mainRank;
  if (!rank) return [];

  const profRes = normRes(profile.reservationGroup);
  const profSub = normSub(profile.subcategory);
  const profRegion = profile.region.toLowerCase().trim(); // 'delhi' or 'outside delhi'
  const isDelhiCandidate = profRegion === 'delhi';

  const out: JacResult[] = [];

  for (const rec of records) {
    // institute filter
    if (filters.institutes.length > 0 && !filters.institutes.includes(rec.institute)) continue;

    // IGDTUW: women-only
    if (rec.institute === 'IGDTUW' && profile.gender !== 'female') continue;

    // campus filter (NSUT)
    if (filters.campuses.length > 0 && !filters.campuses.includes(rec.campus)) continue;

    // IIIT-D bonus type
    if (rec.institute === 'IIIT-D' && rec.bonusType) {
      if (filters.bonusType !== 'Both' && rec.bonusType !== filters.bonusType) continue;
    }

    // reservation group match
    if (normRes(rec.reservationGroup) !== profRes) continue;

    // subcategory: neutral candidates match neutral rows only
    // girl candidates match girl rows + neutral rows (girls can apply to both)
    const recSub = normSub(rec.subcategory);
    if (profSub === 'NEUTRAL') {
      if (recSub !== 'NEUTRAL') continue;
    } else if (profSub === 'GIRL') {
      if (recSub !== 'NEUTRAL' && recSub !== 'GIRL') continue;
    } else {
      // defence, pwd, km — exact match
      if (recSub !== profSub && recSub !== 'NEUTRAL') continue;
    }

    // region: Delhi candidates see Delhi rows only; outside sees Outside Delhi rows only
    const recRegion = rec.region.toLowerCase().trim();
    const recIsDelhi = recRegion === 'delhi';
    if (isDelhiCandidate && !recIsDelhi) continue;
    if (!isDelhiCandidate && recIsDelhi) continue;

    // closing rank
    const closing = rec.finalRank;
    if (!closing || closing <= 0) continue;

    // classify
    const lbl = label(rank, closing);
    if (lbl === 'Out of Range') continue;

    // text search
    if (filters.searchText.trim()) {
      const q = filters.searchText.toLowerCase();
      if (!rec.branch.toLowerCase().includes(q) &&
          !rec.institute.toLowerCase().includes(q) &&
          !rec.instituteFull.toLowerCase().includes(q)) continue;
    }

    out.push({ ...rec, label: lbl, rankGap: closing - rank, candidateRank: rank, score: score(closing) });
  }

  return sortJac(out, filters.sortBy);
}

function sortJac(r: JacResult[], by: JacFilters['sortBy']): JacResult[] {
  const lo: Record<string, number> = { Safe: 0, Target: 1, Ambitious: 2 };
  return [...r].sort((a, b) => {
    if (by === 'lowestClosing') return (a.finalRank ?? 0) - (b.finalRank ?? 0);
    if (by === 'nameAZ') return a.branch.localeCompare(b.branch);
    if (by === 'institute') return a.institute.localeCompare(b.institute) || a.branch.localeCompare(b.branch);
    const ld = (lo[a.label] ?? 9) - (lo[b.label] ?? 9);
    if (ld !== 0) return ld;
    return (a.finalRank ?? 0) - (b.finalRank ?? 0);
  });
}

export function jacStats(results: JacResult[]): JacStats {
  let safe = 0, target = 0, ambitious = 0;
  for (const r of results) {
    if (r.label === 'Safe') safe++;
    else if (r.label === 'Target') target++;
    else if (r.label === 'Ambitious') ambitious++;
  }
  return { total: results.length, safe, target, ambitious };
}

export function exportJacCSV(results: JacResult[]) {
  const h = ['Institute','Branch','Campus','Category','Region','R1','R2','R3','R4','R5','Final','Your Rank','Gap','Match'];
  const rows = results.map(r => [
    r.institute, `"${r.branch}"`, r.campus, r.category, r.region,
    r.r1??'', r.r2??'', r.r3??'', r.r4??'', r.r5??'',
    r.finalRank??'', r.candidateRank, r.rankGap, r.label,
  ]);
  const csv = [h.join(','), ...rows.map(r => r.join(','))].join('\n');
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
    download: 'jac-predictions.csv',
  });
  a.click();
}

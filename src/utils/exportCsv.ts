import type { JosaaResult } from '../types';

export function exportJosaaCsv(results: JosaaResult[], name = 'josaa-predictions.csv') {
  const h = ['Institute','Program','Type','Quota','Seat Type','Gender','Opening','Closing','Your Rank','Gap','Match'];
  const rows = results.map(r => [
    `"${r.institute}"`, `"${r.program}"`, r.instType, r.quota, r.seatType,
    `"${r.gender}"`, r.openingRank??'', r.closingRank??'', r.candidateRank, r.rankGap, r.label,
  ]);
  const csv = [h.join(','), ...rows.map(r => r.join(','))].join('\n');
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
    download: name,
  });
  a.click();
}

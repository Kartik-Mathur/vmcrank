import { useState } from 'react';
import { ArrowUpDown, Bookmark, BookmarkCheck, PlusCircle, MinusCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { JosaaResult } from '../../types';
import { LabelBadge, InstBadge } from '../shared/Badge';
import { QUOTA_LABELS } from '../../constants';

interface Props {
  results: JosaaResult[]; bookmarks: Set<string>; compare: JosaaResult[];
  onBookmark: (k: string) => void; onCompare: (r: JosaaResult) => void;
}

const key = (r: JosaaResult) => `${r.institute}||${r.program}||${r.quota}||${r.seatType}`;

type Col = keyof JosaaResult;

export function JosaaTable({ results, bookmarks, compare, onBookmark, onCompare }: Props) {
  const [col, setCol] = useState<Col>('closingRank');
  const [dir, setDir] = useState<1|-1>(1);

  const sorted = [...results].sort((a, b) => {
    const av = a[col], bv = b[col];
    if (typeof av === 'number' && typeof bv === 'number') return dir * (av - bv);
    return dir * String(av ?? '').localeCompare(String(bv ?? ''));
  });

  const Th = ({ c, children }: { c: Col; children: React.ReactNode }) => (
    <th onClick={() => { if (col === c) setDir(d => (d * -1) as 1|-1); else { setCol(c); setDir(1); } }}
      className="px-3 py-3 text-left text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-800 whitespace-nowrap select-none">
      <span className="flex items-center gap-1">
        {children}<ArrowUpDown size={11} className={cn('opacity-30', col === c && 'opacity-80 text-brand-600')} />
      </span>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white">
      <table className="w-full min-w-[960px] text-sm">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-3 py-3 w-16"></th>
            <Th c="institute">Institute</Th>
            <Th c="program">Program</Th>
            <Th c="instType">Type</Th>
            <Th c="quota">Quota</Th>
            <Th c="seatType">Category</Th>
            <Th c="openingRank">Opening</Th>
            <Th c="closingRank">Closing</Th>
            <Th c="candidateRank">Your Rank</Th>
            <Th c="rankGap">Gap</Th>
            <Th c="label">Match</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {sorted.map((r, i) => {
            const k = key(r);
            const isComp = compare.some(c => key(c) === k);
            return (
              <tr key={i} className={cn('hover:bg-slate-50/60', i % 2 !== 0 && 'bg-slate-50/30')}>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    <button onClick={() => onBookmark(k)} className="p-1 rounded hover:bg-slate-100">
                      {bookmarks.has(k) ? <BookmarkCheck size={13} className="text-brand-600" /> : <Bookmark size={13} className="text-slate-300" />}
                    </button>
                    <button onClick={() => onCompare(r)} disabled={compare.length >= 3 && !isComp}
                      className={cn('p-1 rounded hover:bg-slate-100', compare.length >= 3 && !isComp && 'opacity-25 cursor-not-allowed')}>
                      {isComp ? <MinusCircle size={13} className="text-red-400" /> : <PlusCircle size={13} className="text-slate-300" />}
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-xs font-medium text-slate-700 max-w-[180px]"><div className="truncate">{r.institute}</div></td>
                <td className="px-3 py-2.5 text-xs text-slate-500 max-w-[180px]"><div className="truncate">{r.program}</div></td>
                <td className="px-3 py-2.5"><InstBadge type={r.instType} sm /></td>
                <td className="px-3 py-2.5 text-xs text-slate-600">{QUOTA_LABELS[r.quota] ?? r.quota}</td>
                <td className="px-3 py-2.5 text-xs text-slate-600">{r.seatType}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-slate-500">{r.openingRank?.toLocaleString() ?? '—'}</td>
                <td className="px-3 py-2.5 font-mono text-xs font-bold text-slate-800">{r.closingRank?.toLocaleString() ?? '—'}</td>
                <td className="px-3 py-2.5 font-mono text-xs font-semibold text-brand-700">{r.candidateRank.toLocaleString()}</td>
                <td className={cn('px-3 py-2.5 font-mono text-xs font-semibold', r.rankGap >= 0 ? 'text-emerald-600' : 'text-amber-600')}>
                  {r.rankGap >= 0 ? `+${r.rankGap.toLocaleString()}` : r.rankGap.toLocaleString()}
                </td>
                <td className="px-3 py-2.5"><LabelBadge label={r.label} sm /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

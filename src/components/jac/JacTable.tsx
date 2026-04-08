import { useState } from 'react';
import { ArrowUpDown, Bookmark, BookmarkCheck, PlusCircle, MinusCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { JacResult } from '../../types';
import { LabelBadge, JacInstBadge } from '../shared/Badge';

interface Props {
  results: JacResult[]; bookmarks: Set<string>; compare: JacResult[];
  onBookmark: (k: string) => void; onCompare: (r: JacResult) => void;
}

const key = (r: JacResult) => `${r.institute}||${r.branch}||${r.category}`;
type Col = keyof JacResult;

export function JacTable({ results, bookmarks, compare, onBookmark, onCompare }: Props) {
  const [col, setCol] = useState<Col>('finalRank');
  const [dir, setDir] = useState<1|-1>(1);

  const sorted = [...results].sort((a, b) => {
    const av = a[col], bv = b[col];
    if (typeof av === 'number' && typeof bv === 'number') return dir * (av - bv);
    return dir * String(av ?? '').localeCompare(String(bv ?? ''));
  });

  const Th = ({ c, children, cls='' }: { c: Col; children: React.ReactNode; cls?: string }) => (
    <th onClick={() => { if (col === c) setDir(d => (d * -1) as 1|-1); else { setCol(c); setDir(1); } }}
      className={cn('px-3 py-3 text-left text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-800 whitespace-nowrap select-none', cls)}>
      <span className="flex items-center gap-1">
        {children}<ArrowUpDown size={11} className={cn('opacity-30', col === c && 'opacity-80 text-emerald-600')} />
      </span>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-sm bg-white">
      <table className="w-full min-w-[1000px] text-sm">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-3 py-3 w-16"></th>
            <Th c="institute">Inst.</Th>
            <Th c="branch">Branch</Th>
            <Th c="campus">Campus</Th>
            <Th c="category">Cat.</Th>
            <Th c="region">Region</Th>
            <Th c="r1" cls="w-20">R1</Th>
            <Th c="r2" cls="w-20">R2</Th>
            <Th c="r3" cls="w-20">R3</Th>
            <Th c="r4" cls="w-20">R4</Th>
            <Th c="r5" cls="w-20">R5</Th>
            <Th c="finalRank" cls="w-24">Final</Th>
            <Th c="rankGap" cls="w-24">Gap</Th>
            <Th c="label" cls="w-28">Match</Th>
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
                      {bookmarks.has(k) ? <BookmarkCheck size={13} className="text-emerald-600" /> : <Bookmark size={13} className="text-slate-300" />}
                    </button>
                    <button onClick={() => onCompare(r)} disabled={compare.length >= 3 && !isComp}
                      className={cn('p-1 rounded hover:bg-slate-100', compare.length >= 3 && !isComp && 'opacity-25 cursor-not-allowed')}>
                      {isComp ? <MinusCircle size={13} className="text-red-400" /> : <PlusCircle size={13} className="text-slate-300" />}
                    </button>
                  </div>
                </td>
                <td className="px-3 py-2.5"><JacInstBadge inst={r.institute} sm /></td>
                <td className="px-3 py-2.5 text-xs font-medium text-slate-700 max-w-[180px]"><div className="truncate">{r.branch}</div></td>
                <td className="px-3 py-2.5 text-xs text-slate-500">{r.campus}</td>
                <td className="px-3 py-2.5 text-xs font-mono text-slate-600">{r.category}</td>
                <td className="px-3 py-2.5 text-xs text-slate-500">{r.region}</td>
                {[r.r1,r.r2,r.r3,r.r4,r.r5].map((v,ri) => (
                  <td key={ri} className="px-3 py-2.5 font-mono text-xs text-slate-400">{v?.toLocaleString() ?? '—'}</td>
                ))}
                <td className="px-3 py-2.5 font-mono text-xs font-bold text-slate-800">{r.finalRank?.toLocaleString() ?? '—'}</td>
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

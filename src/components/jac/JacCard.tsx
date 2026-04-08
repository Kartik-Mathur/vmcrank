import { Bookmark, BookmarkCheck, PlusCircle, MinusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import type { JacResult } from '../../types';
import { LabelBadge, JacInstBadge } from '../shared/Badge';

interface Props {
  r: JacResult; bookmarked: boolean; inCompare: boolean; canCompare: boolean;
  onBookmark: () => void; onCompare: () => void;
}

const barColors: Record<string, string> = { Safe:'bg-emerald-500', Target:'bg-blue-500', Ambitious:'bg-amber-500' };

export function JacCard({ r, bookmarked, inCompare, canCompare, onBookmark, onCompare }: Props) {
  const [exp, setExp] = useState(false);
  const pct = r.finalRank ? Math.min(100, (r.candidateRank / r.finalRank) * 100) : 0;
  const rounds = [r.r1, r.r2, r.r3, r.r4, r.r5].filter((v): v is number => v !== null);

  return (
    <div className={cn(
      'bg-white rounded-2xl border transition-all hover:shadow-md overflow-hidden flex flex-col',
      inCompare ? 'border-emerald-300 ring-2 ring-emerald-100 shadow-sm' : 'border-slate-100 shadow-sm'
    )}>
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-1.5"><JacInstBadge inst={r.institute} /><LabelBadge label={r.label} /></div>
          <div className="flex gap-0.5 shrink-0">
            <button onClick={onBookmark} className="p-1.5 rounded-lg hover:bg-slate-100">
              {bookmarked ? <BookmarkCheck size={15} className="text-emerald-600" /> : <Bookmark size={15} className="text-slate-300" />}
            </button>
            <button onClick={onCompare} disabled={!canCompare && !inCompare}
              className={cn('p-1.5 rounded-lg hover:bg-slate-100', !canCompare && !inCompare && 'opacity-25 cursor-not-allowed')}>
              {inCompare ? <MinusCircle size={15} className="text-red-400" /> : <PlusCircle size={15} className="text-slate-300" />}
            </button>
          </div>
        </div>
        <h3 className="font-semibold text-slate-800 text-sm leading-snug">{r.instituteFull}</h3>
        <p className="text-sm font-medium text-slate-700 mt-1">{r.branch}</p>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{r.campus}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{r.region}</span>
          {r.bonusType && (
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
              r.bonusType === 'With Bonus' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500')}>
              {r.bonusType}
            </span>
          )}
        </div>
      </div>

      {/* Rank bar */}
      <div className="px-4 pb-3">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Rank vs final cutoff</span>
          <span className={cn('font-semibold',
            r.label === 'Safe' ? 'text-emerald-600' : r.label === 'Target' ? 'text-blue-600' : 'text-amber-600')}>
            {r.rankGap >= 0 ? `${r.rankGap.toLocaleString()} buffer` : `${Math.abs(r.rankGap).toLocaleString()} over`}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full', barColors[r.label] ?? 'bg-slate-300')} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
          <span>R1: <span className="text-slate-600">{r.r1?.toLocaleString() ?? '—'}</span></span>
          <span>Final: <span className="text-slate-700 font-semibold">{r.finalRank?.toLocaleString() ?? '—'}</span></span>
        </div>
      </div>

      {/* Round trend mini-chart */}
      {rounds.length > 1 && (
        <div className="px-4 pb-3">
          <div className="text-[10px] text-slate-400 mb-1.5">Round-wise cutoff trend (cutoff relaxes each round ↓)</div>
          <div className="flex items-end gap-1 h-10">
            {rounds.map((v, i) => {
              const max = Math.max(...rounds);
              const h = Math.max(4, Math.round((v / max) * 32));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="text-[9px] text-slate-400 leading-none font-mono">
                    {v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                  </div>
                  <div className={cn('w-full rounded-t-sm transition-all', i === rounds.length - 1 ? 'bg-emerald-400' : 'bg-slate-200')}
                    style={{ height: `${h}px` }} />
                  <div className="text-[9px] text-slate-300">R{i+1}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="px-4 pb-3 grid grid-cols-3 gap-2">
        {[['Your Rank', r.candidateRank.toLocaleString(), 'text-emerald-700'],
          ['Final Cutoff', r.finalRank?.toLocaleString() ?? '—', 'text-slate-800'],
          ['Category', r.category, 'text-slate-700']].map(([lbl,val,cls]) => (
          <div key={lbl} className="bg-slate-50 rounded-xl p-2 text-center">
            <div className="text-[10px] text-slate-400 mb-0.5">{lbl}</div>
            <div className={cn('font-mono font-bold text-xs truncate', cls)}>{val}</div>
          </div>
        ))}
      </div>

      <button onClick={() => setExp(e => !e)}
        className="mt-auto w-full px-4 py-2 flex items-center justify-between text-xs text-slate-400 hover:bg-slate-50 border-t border-slate-50">
        Round-wise details {exp ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {exp && (
        <div className="border-t border-slate-50 bg-slate-50/60 px-4 pb-4 pt-3 grid grid-cols-2 gap-2">
          {rounds.map((v,i) => (
            <div key={i} className="bg-white rounded-xl p-2 border border-slate-100">
              <div className="text-[10px] text-slate-400">Round {i+1}</div>
              <div className="font-mono font-semibold text-xs text-slate-700 mt-0.5">{v.toLocaleString()}</div>
            </div>
          ))}
          <div className="bg-white rounded-xl p-2 border border-slate-100 col-span-2">
            <div className="text-[10px] text-slate-400">Category Full Form</div>
            <div className="text-xs font-medium text-slate-700 mt-0.5 leading-snug">{r.categoryFull}</div>
          </div>
        </div>
      )}
    </div>
  );
}

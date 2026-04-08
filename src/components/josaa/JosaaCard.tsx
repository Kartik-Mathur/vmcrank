import { Bookmark, BookmarkCheck, PlusCircle, MinusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import type { JosaaResult } from '../../types';
import { LabelBadge, InstBadge } from '../shared/Badge';
import { QUOTA_LABELS } from '../../constants';

interface Props {
  r: JosaaResult; bookmarked: boolean; inCompare: boolean; canCompare: boolean;
  onBookmark: () => void; onCompare: () => void;
}

const barColors: Record<string, string> = { Safe:'bg-emerald-500', Target:'bg-blue-500', Ambitious:'bg-amber-500' };

export function JosaaCard({ r, bookmarked, inCompare, canCompare, onBookmark, onCompare }: Props) {
  const [exp, setExp] = useState(false);
  const pct = r.closingRank ? Math.min(100, (r.candidateRank / r.closingRank) * 100) : 0;

  return (
    <div className={cn(
      'bg-white rounded-2xl border transition-all hover:shadow-md overflow-hidden flex flex-col',
      inCompare ? 'border-brand-300 ring-2 ring-brand-100 shadow-sm' : 'border-slate-100 shadow-sm'
    )}>
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-1.5"><InstBadge type={r.instType} /><LabelBadge label={r.label} /></div>
          <div className="flex gap-0.5 shrink-0">
            <button onClick={onBookmark} className="p-1.5 rounded-lg hover:bg-slate-100" title="Bookmark">
              {bookmarked ? <BookmarkCheck size={15} className="text-brand-600" /> : <Bookmark size={15} className="text-slate-300" />}
            </button>
            <button onClick={onCompare} disabled={!canCompare && !inCompare}
              className={cn('p-1.5 rounded-lg hover:bg-slate-100', !canCompare && !inCompare && 'opacity-25 cursor-not-allowed')}>
              {inCompare ? <MinusCircle size={15} className="text-red-400" /> : <PlusCircle size={15} className="text-slate-300" />}
            </button>
          </div>
        </div>
        <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">{r.institute}</h3>
        <p className="text-xs text-slate-500 mt-1 leading-snug line-clamp-2">{r.program}</p>
        <div className="flex gap-1.5 mt-2 flex-wrap">
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{QUOTA_LABELS[r.quota] ?? r.quota}</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{r.gender.includes('Female') ? 'Female-only' : 'GN'}</span>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Your rank vs cutoff</span>
          <span className={cn('font-semibold',
            r.label === 'Safe' ? 'text-emerald-600' : r.label === 'Target' ? 'text-blue-600' : 'text-amber-600')}>
            {r.rankGap >= 0 ? `${r.rankGap.toLocaleString()} buffer` : `${Math.abs(r.rankGap).toLocaleString()} over`}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full', barColors[r.label] ?? 'bg-slate-300')} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
          <span>Open: <span className="text-slate-600">{r.openingRank?.toLocaleString() ?? '—'}</span></span>
          <span>Close: <span className="text-slate-700 font-semibold">{r.closingRank?.toLocaleString() ?? '—'}</span></span>
        </div>
      </div>

      <div className="px-4 pb-3 grid grid-cols-3 gap-2">
        {[['Your Rank', r.candidateRank.toLocaleString(), 'text-brand-700'],
          ['Closing', r.closingRank?.toLocaleString() ?? '—', 'text-slate-800'],
          ['Category', r.seatType, 'text-slate-700']].map(([lbl,val,cls]) => (
          <div key={lbl} className="bg-slate-50 rounded-xl p-2 text-center">
            <div className="text-[10px] text-slate-400 mb-0.5">{lbl}</div>
            <div className={cn('font-mono font-bold text-xs truncate', cls)}>{val}</div>
          </div>
        ))}
      </div>

      <button onClick={() => setExp(e => !e)}
        className="mt-auto w-full px-4 py-2 flex items-center justify-between text-xs text-slate-400 hover:bg-slate-50 border-t border-slate-50">
        More details {exp ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {exp && (
        <div className="border-t border-slate-50 bg-slate-50/60 px-4 pb-4 pt-3 grid grid-cols-2 gap-2">
          {[['Opening Rank', r.openingRank?.toLocaleString() ?? '—'],
            ['Closing Rank', r.closingRank?.toLocaleString() ?? '—'],
            ['Buffer', r.rankGap >= 0 ? `+${r.rankGap.toLocaleString()}` : r.rankGap.toLocaleString()],
            ['Quota', QUOTA_LABELS[r.quota] ?? r.quota],
            ['Score', `${r.score}/100`],
            ['Type', r.instType]].map(([k,v]) => (
            <div key={k} className="bg-white rounded-xl p-2 border border-slate-100">
              <div className="text-[10px] text-slate-400">{k}</div>
              <div className="text-xs font-semibold text-slate-700 mt-0.5 font-mono">{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

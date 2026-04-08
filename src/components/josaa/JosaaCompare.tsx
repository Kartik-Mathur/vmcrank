import { X, Scale } from 'lucide-react';
import type { JosaaResult } from '../../types';
import { LabelBadge, InstBadge } from '../shared/Badge';
import { QUOTA_LABELS } from '../../constants';
import { cn } from '../../utils/cn';

interface Props { items: JosaaResult[]; onClose: () => void; onRemove: (r: JosaaResult) => void; }

export function JosaaCompare({ items, onClose, onRemove }: Props) {
  if (!items.length) return null;
  const rows: [string, (r: JosaaResult) => React.ReactNode][] = [
    ['Type', r => <InstBadge type={r.instType} />],
    ['Quota', r => <span className="text-xs">{QUOTA_LABELS[r.quota] ?? r.quota}</span>],
    ['Category', r => <span className="text-xs">{r.seatType}</span>],
    ['Gender', r => <span className="text-xs">{r.gender.includes('Female') ? 'Female-only' : 'GN'}</span>],
    ['Opening Rank', r => <span className="font-mono text-sm">{r.openingRank?.toLocaleString() ?? '—'}</span>],
    ['Closing Rank', r => <span className="font-mono font-bold text-lg">{r.closingRank?.toLocaleString() ?? '—'}</span>],
    ['Your Rank', r => <span className="font-mono font-bold text-brand-700 text-lg">{r.candidateRank.toLocaleString()}</span>],
    ['Buffer', r => <span className={cn('font-mono font-semibold text-sm', r.rankGap >= 0 ? 'text-emerald-600' : 'text-amber-600')}>
      {r.rankGap >= 0 ? `+${r.rankGap.toLocaleString()}` : r.rankGap.toLocaleString()}</span>],
    ['Match', r => <LabelBadge label={r.label} />],
    ['Score', r => (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-brand-500 rounded-full" style={{ width: `${r.score}%` }} /></div>
        <span className="text-xs font-mono">{r.score}</span>
      </div>
    )],
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mt-8 mb-8 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2"><Scale size={18} className="text-brand-600" />
            <h2 className="font-bold text-slate-800">Compare JoSAA Programs</h2>
            <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">{items.length}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200"><X size={18} className="text-slate-500" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-5 py-3 text-left text-xs text-slate-400 font-semibold w-36 bg-slate-50/60">Field</th>
                {items.map((r, i) => (
                  <th key={i} className="px-5 py-3 text-left min-w-[200px]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-800 text-sm leading-tight">{r.institute}</div>
                        <div className="text-xs text-slate-500 mt-0.5 leading-tight">{r.program}</div>
                      </div>
                      <button onClick={() => onRemove(r)} className="p-1 hover:bg-red-50 rounded shrink-0"><X size={13} className="text-red-400" /></button>
                    </div>
                  </th>
                ))}
                {Array.from({ length: 3 - items.length }).map((_, j) => <th key={j} className="px-5 py-3 min-w-[160px]" />)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map(([lbl, render]) => (
                <tr key={lbl} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 text-xs font-semibold text-slate-500 bg-slate-50/40">{lbl}</td>
                  {items.map((r, i) => <td key={i} className="px-5 py-3">{render(r)}</td>)}
                  {Array.from({ length: 3 - items.length }).map((_, j) => <td key={j} className="px-5 py-3 text-slate-200 text-xs">—</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

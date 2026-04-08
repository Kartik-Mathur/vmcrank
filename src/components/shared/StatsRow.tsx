import { Download, Scale, LayoutGrid, List } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Props {
  stats: { total: number; safe: number; target: number; ambitious: number };
  onExport: () => void;
  onCompare: () => void;
  compareCount: number;
  viewMode: 'card' | 'table';
  setViewMode: (v: 'card' | 'table') => void;
  accent: 'brand' | 'emerald';
  extraInfo?: React.ReactNode;
}

export function StatsRow({ stats, onExport, onCompare, compareCount, viewMode, setViewMode, accent, extraInfo }: Props) {
  const ring = accent === 'emerald'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
    : 'bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100';
  const activeView = accent === 'emerald' ? 'text-emerald-600' : 'text-brand-600';

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label:'Total', value: stats.total, bg:'bg-slate-800 text-white', icon:'🎓' },
          { label:'Safe',  value: stats.safe,  bg:'bg-emerald-50 text-emerald-800', icon:'✓' },
          { label:'Target',value: stats.target,bg:'bg-blue-50 text-blue-800', icon:'◎' },
          { label:'Ambitious',value:stats.ambitious,bg:'bg-amber-50 text-amber-800',icon:'↑' },
        ].map(({ label, value, bg, icon }) => (
          <div key={label} className={cn('rounded-2xl p-3 flex items-center gap-3', bg)}>
            <span className="text-xl">{icon}</span>
            <div>
              <div className="text-2xl font-bold leading-none">{value.toLocaleString()}</div>
              <div className="text-xs font-semibold mt-0.5 opacity-80">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between bg-white rounded-xl border border-slate-100 px-3 py-2 flex-wrap gap-2">
        <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
          <span><span className="font-semibold text-slate-800">{stats.total.toLocaleString()}</span> results</span>
          {extraInfo}
        </div>
        <div className="flex items-center gap-2">
          {compareCount > 0 && (
            <button onClick={onCompare}
              className={cn('flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-lg font-semibold', ring)}>
              <Scale size={13} /> Compare ({compareCount})
            </button>
          )}
          <button onClick={onExport}
            className="flex items-center gap-1.5 text-xs text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50">
            <Download size={13} /> CSV
          </button>
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            {(['card','table'] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                className={cn('p-1.5 rounded-md transition-all', viewMode === v ? `bg-white shadow-sm ${activeView}` : 'text-slate-400')}>
                {v === 'card' ? <LayoutGrid size={14} /> : <List size={14} />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { Search, Zap, Info } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useStore } from '../../store/index';

const CATS = ['OPEN','EWS','OBC-NCL','SC','ST','OPEN (PwD)','OBC-NCL (PwD)','EWS (PwD)','SC (PwD)','ST (PwD)'];

export function JosaaInputForm() {
  const { josaaProfile: P, setJosaaProfile: setP, josaaFilters: F, setJosaaFilters: setF, josaaSearched, setJosaaSearched } = useStore();

  const showAdv = F.instTypeFilter === 'IIT' || F.instTypeFilter === 'ALL';
  const showMain = F.instTypeFilter !== 'IIT';

  const predict = () => setJosaaSearched(true);
  const hasRank = !!(P.advRank || P.mainRank);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-sm">JoSAA Profile</h2>
          <p className="text-xs text-slate-400">IITs (JEE Advanced) · NITs / IIITs / GFTIs (JEE Main)</p>
        </div>
      </div>

      {/* Institute type filter chips */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Show Institutes</div>
        <div className="flex gap-2 flex-wrap">
          {(['ALL','IIT','NIT','IIIT','GFTI'] as const).map(t => (
            <button key={t} onClick={() => setF({ instTypeFilter: t })}
              className={cn('px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all',
                F.instTypeFilter === t
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600')}>
              {t === 'ALL' ? 'All Institutes' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {showAdv && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              JEE Advanced Rank <span className="font-normal text-slate-400">(IITs)</span>
            </label>
            <input type="number" min={1} max={250000} placeholder="e.g. 3500"
              value={P.advRank ?? ''}
              onChange={e => setP({ advRank: e.target.value ? +e.target.value : null })}
              onKeyDown={e => e.key === 'Enter' && predict()}
              className="w-full font-mono text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder-slate-300" />
          </div>
        )}
        {showMain && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              JEE Main CRL Rank <span className="font-normal text-slate-400">(NITs / IIITs)</span>
            </label>
            <input type="number" min={1} max={1200000} placeholder="e.g. 25000"
              value={P.mainRank ?? ''}
              onChange={e => setP({ mainRank: e.target.value ? +e.target.value : null })}
              onKeyDown={e => e.key === 'Enter' && predict()}
              className="w-full font-mono text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder-slate-300" />
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
          <select value={P.category}
            onChange={e => { setP({ category: e.target.value }); setF({ seatTypes: [] }); }}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white text-slate-700">
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gender Pool</label>
          <select value={P.gender} onChange={e => setP({ gender: e.target.value })}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white text-slate-700">
            <option value="Gender-Neutral">Gender-Neutral</option>
            <option value="Female-only">Female (GN + Female-only seats)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
          <input type="text" placeholder="Search institute or branch…"
            value={F.searchText} onChange={e => setF({ searchText: e.target.value })}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 placeholder-slate-300" />
        </div>
        <button onClick={predict} disabled={!hasRank}
          className={cn('flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0',
            hasRank ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed')}>
          <Zap size={14} />
          {josaaSearched ? 'Update' : 'Predict'}
        </button>
      </div>

      <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-400">
        <Info size={12} className="mt-0.5 shrink-0" />
        <span>Category auto-set to <strong className="text-slate-600">{P.category}</strong>. IITs use JEE Advanced + AI quota. NITs/IIITs use JEE Main + HS/OS quota.</span>
      </div>
    </div>
  );
}

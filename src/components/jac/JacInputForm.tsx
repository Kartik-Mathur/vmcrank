import { Search, Zap, Info, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useStore } from '../../store/index';

export function JacInputForm() {
  const { jacProfile: P, setJacProfile: setP, jacFilters: F, setJacFilters: setF, jacSearched, setJacSearched } = useStore();
  const hasRank = !!P.mainRank;

  const handleSubcat = (v: string) => {
    const isGirl = v.toLowerCase().includes('girl');
    setP({ subcategory: v, gender: isGirl ? 'female' : P.gender });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm">
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-sm">JAC Delhi Profile</h2>
          <p className="text-xs text-slate-400">DTU · NSUT · IGDTUW · IIIT-D — via JEE Main rank only</p>
        </div>
      </div>

      {P.gender === 'male' && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 text-xs text-amber-700">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>IGDTUW is women-only and will be excluded from your results.</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">JEE Main Rank (CRL)</label>
          <input type="number" min={1} max={1200000} placeholder="e.g. 18000"
            value={P.mainRank ?? ''}
            onChange={e => setP({ mainRank: e.target.value ? +e.target.value : null })}
            onKeyDown={e => e.key === 'Enter' && hasRank && setJacSearched(true)}
            className="w-full font-mono text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-slate-300" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category</label>
          <select value={P.reservationGroup} onChange={e => setP({ reservationGroup: e.target.value })}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-slate-700">
            {['General','EWS','OBC','SC','ST'].map(v => <option key={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Subcategory</label>
          <select value={P.subcategory} onChange={e => handleSubcat(e.target.value)}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-slate-700">
            {[
              ['Gender Neutral','Gender Neutral / No Subcategory'],
              ['Girl Child','Girl Child (GL)'],
              ['Single Girl Child','Single Girl Child'],
              ['PwD','Persons with Disability (PwD)'],
              ['CW / Defence','Child/Ward of Defence (CW)'],
              ['Kashmiri Migrant','Kashmiri Migrant (KM)'],
            ].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Region (Domicile)</label>
          <select value={P.region} onChange={e => setP({ region: e.target.value })}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-slate-700">
            <option value="Delhi">Delhi Resident</option>
            <option value="Outside Delhi">Outside Delhi</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gender</label>
          <select value={P.gender} onChange={e => setP({ gender: e.target.value })}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white text-slate-700">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
          <input type="text" placeholder="Search institute or branch…"
            value={F.searchText} onChange={e => setF({ searchText: e.target.value })}
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 placeholder-slate-300" />
        </div>
        <button onClick={() => setJacSearched(true)} disabled={!hasRank}
          className={cn('flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0',
            hasRank ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed')}>
          <Zap size={14} />{jacSearched ? 'Update' : 'Predict'}
        </button>
      </div>

      <div className="mt-3 flex items-start gap-1.5 text-xs text-slate-400">
        <Info size={12} className="mt-0.5 shrink-0" />
        <span>
          JAC uses <strong className="text-slate-600">JEE Main rank only</strong>. Category code e.g.{' '}
          <code className="bg-slate-100 px-1 rounded">GNGND</code> = General, Gender Neutral, Delhi.
          Delhi residents get ~85% home-state advantage.
        </span>
      </div>
    </div>
  );
}

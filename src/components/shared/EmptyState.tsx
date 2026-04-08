import { RotateCcw } from 'lucide-react';

interface Props { hasFilters: boolean; hasRank: boolean; onReset: () => void; mode: 'josaa' | 'jac'; }

export function EmptyState({ hasFilters, hasRank, onReset, mode }: Props) {
  if (!hasRank) {
    const items = mode === 'josaa'
      ? [{ icon:'🏛️',count:'23',label:'IITs',sub:'JEE Advanced'},{icon:'🎯',count:'31',label:'NITs',sub:'JEE Main'},{icon:'💻',count:'24',label:'IIITs',sub:'JEE Main'},{icon:'🏫',count:'50',label:'GFTIs',sub:'JEE Main'}]
      : [{ icon:'🔵',count:'427',label:'DTU',sub:'5 rounds'},{icon:'🟢',count:'779',label:'NSUT',sub:'3 campuses'},{icon:'🩷',count:'148',label:'IGDTUW',sub:'Women-only'},{icon:'🟣',count:'144',label:'IIIT-D',sub:'2 rounds'}];
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
        <div className="text-5xl mb-4">{mode === 'josaa' ? '🎓' : '🏛️'}</div>
        <h3 className="font-bold text-slate-800 text-lg mb-2">Enter your rank to find matches</h3>
        <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
          {mode === 'josaa'
            ? 'Enter JEE Advanced rank for IITs or JEE Main rank for NITs/IIITs/GFTIs, pick your category and click Predict.'
            : 'Enter your JEE Main rank, select reservation category, subcategory and Delhi/Outside Delhi region, then click Predict.'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
          {items.map(({icon,count,label,sub}) => (
            <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="font-bold text-slate-800 text-lg leading-none">{count}</div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">{label}</div>
              <div className="text-xs text-slate-400">{sub}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
      <div className="text-4xl mb-3">🔍</div>
      <h3 className="font-bold text-slate-800 text-lg mb-2">No results found</h3>
      <p className="text-slate-400 text-sm mb-5 max-w-xs mx-auto leading-relaxed">
        {hasFilters ? 'Your filters are too narrow. Try removing some filters.' : 'No programs matched your rank. Try enabling Ambitious picks in the sidebar.'}
      </p>
      <button onClick={onReset}
        className="inline-flex items-center gap-2 bg-brand-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors">
        <RotateCcw size={14} /> Reset filters
      </button>
    </div>
  );
}

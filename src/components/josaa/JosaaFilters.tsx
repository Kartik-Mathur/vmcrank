import { X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { useStore } from '../../store/index';
import { QUOTA_LABELS, SEAT_TYPE_ORDER, INDIAN_STATES } from '../../constants';

interface Props { availableQuotas: string[]; availableSeatTypes: string[]; onClose?: () => void; }

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:bg-slate-50">
        {title} {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export function JosaaFilters({ availableQuotas, availableSeatTypes, onClose }: Props) {
  const { josaaFilters: F, setJosaaFilters: setF, resetJosaaFilters, josaaProfile: P, setJosaaProfile: setP } = useStore();
  const tog = (arr: string[], v: string) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  return (
    <div className="bg-white h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
        <span className="font-semibold text-slate-800 text-sm">Filters</span>
        <div className="flex items-center gap-2">
          <button onClick={resetJosaaFilters} className="flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600">
            <RotateCcw size={12} /> Reset
          </button>
          {onClose && <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X size={16} className="text-slate-400" /></button>}
        </div>
      </div>
      <div className="overflow-y-auto flex-1 scrollbar-thin">
        <Sec title="Category">
          {SEAT_TYPE_ORDER.filter(s => availableSeatTypes.includes(s)).map(st => (
            <label key={st} className="flex items-center gap-2 cursor-pointer mb-1">
              <input type="checkbox" checked={F.seatTypes.includes(st)} onChange={() => setF({ seatTypes: tog(F.seatTypes, st) })}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <span className="text-xs text-slate-700">{st}</span>
            </label>
          ))}
          <p className="text-xs text-slate-400 mt-1">None = auto-match your category ({P.category})</p>
        </Sec>
        <Sec title="Quota">
          {availableQuotas.map(q => (
            <label key={q} className="flex items-center gap-2 cursor-pointer mb-1">
              <input type="checkbox" checked={F.quotas.includes(q)} onChange={() => setF({ quotas: tog(F.quotas, q) })}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <span className="text-xs text-slate-700">{QUOTA_LABELS[q] ?? q} <span className="text-slate-400">({q})</span></span>
            </label>
          ))}
          <p className="text-xs text-slate-400 mt-1">HS = Home State · OS = Other State · AI = All India</p>
        </Sec>
        <Sec title="Home State (HS quota)">
          <select value={P.homeState} onChange={e => setP({ homeState: e.target.value })}
            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-400">
            <option value="">Select state</option>
            {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Sec>
        <Sec title="Sort By">
          {[['bestMatch','Best Match'],['lowestClosing','Lowest Closing Rank'],['highestClosing','Highest Closing Rank'],['nameAZ','Institute Name A–Z']].map(([v,l]) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer mb-1">
              <input type="radio" name="josaaSort" checked={F.sortBy === v} onChange={() => setF({ sortBy: v as typeof F.sortBy })}
                className="text-brand-600 focus:ring-brand-500" />
              <span className="text-xs text-slate-700">{l}</span>
            </label>
          ))}
        </Sec>
      </div>
    </div>
  );
}

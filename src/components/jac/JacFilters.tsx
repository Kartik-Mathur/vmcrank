import { X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { useStore } from '../../store/index';
import { JAC_INST_META } from '../../constants';

interface Props { onClose?: () => void; }

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

export function JacFilters({ onClose }: Props) {
  const { jacFilters: F, setJacFilters: setF, resetJacFilters } = useStore();
  const tog = (arr: string[], v: string) => arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];

  return (
    <div className="bg-white h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
        <span className="font-semibold text-slate-800 text-sm">Filters</span>
        <div className="flex items-center gap-2">
          <button onClick={resetJacFilters} className="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600">
            <RotateCcw size={12} /> Reset
          </button>
          {onClose && <button onClick={onClose} className="p-1 rounded hover:bg-slate-100"><X size={16} className="text-slate-400" /></button>}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-thin">
        <Sec title="Institute">
          <div className="space-y-2">
            {Object.values(JAC_INST_META).map(({ short, full, color, note }) => (
              <label key={short} className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={F.institutes.includes(short)}
                  onChange={() => setF({ institutes: tog(F.institutes, short) })}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                <div>
                  <span className={cn('inline text-xs font-bold px-1.5 py-0.5 rounded mr-1', color)}>{short}</span>
                  <span className="text-xs text-slate-500">{full}</span>
                  <div className="text-xs text-slate-400 mt-0.5">{note}</div>
                </div>
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">None = all institutes</p>
        </Sec>

        <Sec title="Campus (NSUT only)">
          {['Main','East','West'].map(c => (
            <label key={c} className="flex items-center gap-2 cursor-pointer mb-1">
              <input type="checkbox" checked={F.campuses.includes(c)}
                onChange={() => setF({ campuses: tog(F.campuses, c) })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              <span className="text-xs text-slate-700">{c} Campus</span>
            </label>
          ))}
        </Sec>

        <Sec title="IIIT-D Board Bonus">
          {['Without Bonus','With Bonus','Both'].map(b => (
            <label key={b} className="flex items-center gap-2 cursor-pointer mb-1">
              <input type="radio" name="bonus" checked={F.bonusType === b}
                onChange={() => setF({ bonusType: b })}
                className="text-emerald-600 focus:ring-emerald-500" />
              <span className="text-xs text-slate-700">{b}</span>
            </label>
          ))}
          <p className="text-xs text-slate-400 mt-1">IIIT-D relaxes cutoff for strong board scores</p>
        </Sec>

        <Sec title="Sort By">
          {[['bestMatch','Best Match'],['lowestClosing','Lowest Closing Rank'],['nameAZ','Branch A–Z'],['institute','By Institute']].map(([v,l]) => (
            <label key={v} className="flex items-center gap-2 cursor-pointer mb-1">
              <input type="radio" name="jacSort" checked={F.sortBy === v}
                onChange={() => setF({ sortBy: v as typeof F.sortBy })}
                className="text-emerald-600 focus:ring-emerald-500" />
              <span className="text-xs text-slate-700">{l}</span>
            </label>
          ))}
        </Sec>

        <Sec title="Advanced">
          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={F.showAmbitious}
              onChange={e => setF({ showAmbitious: e.target.checked })}
              className="mt-0.5 rounded border-slate-300 text-emerald-600" />
            <div>
              <div className="text-xs font-medium text-slate-700">Include Ambitious picks</div>
              <div className="text-xs text-slate-400 mt-0.5">Show programs within 10% over the cutoff</div>
            </div>
          </label>
        </Sec>
      </div>
    </div>
  );
}

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

interface Props { page: number; total: number; perPage: number; onChange: (p: number) => void; }

export function Pagination({ page, total, perPage, onChange }: Props) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;
  const start = page * perPage + 1, end = Math.min((page + 1) * perPage, total);
  const range = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i;
    if (page <= 2) return i;
    if (page >= totalPages - 3) return totalPages - 5 + i;
    return page - 2 + i;
  });
  return (
    <div className="flex items-center justify-between bg-white rounded-xl border border-slate-100 px-4 py-3">
      <span className="text-xs text-slate-400">Showing {start}–{end} of {total.toLocaleString()}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 0}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft size={15} className="text-slate-600" />
        </button>
        {range.map(p => (
          <button key={p} onClick={() => onChange(p)}
            className={cn('w-8 h-8 rounded-lg text-xs font-semibold transition-all',
              p === page ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100')}>
            {p + 1}
          </button>
        ))}
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight size={15} className="text-slate-600" />
        </button>
      </div>
    </div>
  );
}

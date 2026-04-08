import { cn } from '../../utils/cn';
import { LABEL_COLORS, LABEL_ICONS, INST_TYPE_COLORS, JAC_INST_META } from '../../constants';
import type { RecLabel, InstType } from '../../types';

export function LabelBadge({ label, sm }: { label: RecLabel; sm?: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 font-semibold rounded-full border',
      LABEL_COLORS[label],
      sm ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    )}>
      {LABEL_ICONS[label]} {label}
    </span>
  );
}

export function InstBadge({ type, sm }: { type: InstType; sm?: boolean }) {
  return (
    <span className={cn(
      'inline-flex items-center font-bold rounded tracking-wide',
      INST_TYPE_COLORS[type],
      sm ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
    )}>{type}</span>
  );
}

export function JacInstBadge({ inst, sm }: { inst: string; sm?: boolean }) {
  const meta = JAC_INST_META[inst];
  return (
    <span className={cn(
      'inline-flex items-center font-bold rounded tracking-wide',
      meta?.color ?? 'bg-gray-100 text-gray-700',
      sm ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
    )}>{inst}</span>
  );
}

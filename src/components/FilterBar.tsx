import { ExpiryStatus } from '@/lib/medicine';
import { cn } from '@/lib/utils';

export type FilterOption = 'all' | ExpiryStatus;

interface FilterBarProps {
  active: FilterOption;
  onChange: (filter: FilterOption) => void;
  counts: Record<FilterOption, number>;
}

const filters: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'expired', label: 'Expired' },
  { value: 'critical', label: '0–7 days' },
  { value: 'warning', label: '8–30 days' },
  { value: 'safe', label: '31+ days' },
];

export function FilterBar({ active, onChange, counts }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter medicines by expiry status">
      {filters.map(f => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[36px]',
            active === f.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
          aria-pressed={active === f.value}
        >
          {f.label}
          <span className="ml-1.5 text-xs opacity-70">({counts[f.value]})</span>
        </button>
      ))}
    </div>
  );
}

import { cn } from '@/lib/utils';
import { FamilyMember } from '@/hooks/useFamilyMembers';

interface FamilyMemberFilterProps {
  members: FamilyMember[];
  selected: string | null; // null = all
  onChange: (id: string | null) => void;
}

export function FamilyMemberFilter({ members, selected, onChange }: FamilyMemberFilterProps) {
  if (members.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by family member">
      <button
        onClick={() => onChange(null)}
        className={cn(
          'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[36px]',
          selected === null
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        )}
      >
        Everyone
      </button>
      {members.map(m => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[36px]',
            selected === m.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          {m.name}
        </button>
      ))}
    </div>
  );
}

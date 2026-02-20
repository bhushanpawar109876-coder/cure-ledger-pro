import { ExpiryStatus, getStatusLabel } from '@/lib/medicine';
import { cn } from '@/lib/utils';

interface ExpiryBadgeProps {
  status: ExpiryStatus;
  className?: string;
}

const statusStyles: Record<ExpiryStatus, string> = {
  expired: 'bg-expired text-expired-foreground',
  critical: 'bg-expired/15 text-expired border border-expired/30',
  warning: 'bg-warning/15 text-accent-foreground border border-warning/30',
  safe: 'bg-safe/15 text-safe border border-safe/30',
};

export function ExpiryBadge({ status, className }: ExpiryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide',
        statusStyles[status],
        status === 'expired' && 'animate-pulse-gentle',
        className
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}

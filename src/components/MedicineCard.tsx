import { Medicine, getExpiryStatus, getDaysUntilExpiry } from '@/lib/medicine';
import { ExpiryBadge } from './ExpiryBadge';
import { Pill, Hash, Package, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface MedicineCardProps {
  medicine: Medicine;
  onDelete: (id: string) => void;
  index: number;
}

export function MedicineCard({ medicine, onDelete, index }: MedicineCardProps) {
  const status = getExpiryStatus(medicine.expiryDate);
  const days = getDaysUntilExpiry(medicine.expiryDate);

  const daysText = days < 0
    ? `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`
    : days === 0
    ? 'Expires today'
    : `${days} day${days !== 1 ? 's' : ''} left`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group bg-card border border-border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-primary/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="mt-0.5 p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Pill size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-semibold text-card-foreground truncate">{medicine.name}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Hash size={12} /> {medicine.batch}
              </span>
              <span className="inline-flex items-center gap-1">
                <Package size={12} /> Qty: {medicine.quantity}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5">{daysText}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <ExpiryBadge status={status} />
          <button
            onClick={() => onDelete(medicine.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            aria-label={`Delete ${medicine.name}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

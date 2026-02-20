import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Download, Search, Pill, Recycle } from 'lucide-react';
import { useMedicines } from '@/hooks/useMedicines';
import { getExpiryStatus, getDaysUntilExpiry, exportToCSV } from '@/lib/medicine';
import { MedicineCard } from '@/components/MedicineCard';
import { AddMedicineDialog } from '@/components/AddMedicineDialog';
import { FilterBar, FilterOption } from '@/components/FilterBar';
import { ExpiryBadge } from '@/components/ExpiryBadge';
import { DisposalGuideDialog } from '@/components/DisposalGuideDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { medicines, addMedicine, deleteMedicine } = useMedicines();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [search, setSearch] = useState('');

  const sortedMedicines = useMemo(() => {
    return [...medicines].sort((a, b) => getDaysUntilExpiry(a.expiryDate) - getDaysUntilExpiry(b.expiryDate));
  }, [medicines]);

  const counts = useMemo(() => {
    const c: Record<FilterOption, number> = { all: medicines.length, expired: 0, critical: 0, warning: 0, safe: 0 };
    medicines.forEach(m => { c[getExpiryStatus(m.expiryDate)]++; });
    return c;
  }, [medicines]);

  const filtered = useMemo(() => {
    let list = sortedMedicines;
    if (filter !== 'all') list = list.filter(m => getExpiryStatus(m.expiryDate) === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.batch.toLowerCase().includes(q));
    }
    return list;
  }, [sortedMedicines, filter, search]);

  const urgentCount = counts.expired + counts.critical;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative py-10 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground">
                <Shield size={24} />
              </div>
              <span className="font-heading font-bold text-xl text-foreground">MediTrack</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Keep your medicines safe and effective
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-lg">
              Log medicines, track expiry dates, and get timely alerts — promoting household health safety.
            </p>

            {/* Feature bullets */}
            <div className="mt-6 grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Pill size={16} className="mt-0.5 text-primary shrink-0" />
                <span>Add medicines in seconds — name, batch, qty, expiry.</span>
              </div>
              <div className="flex items-start gap-2">
                <Search size={16} className="mt-0.5 text-primary shrink-0" />
                <span>Auto-sorted list with expiry badges and filters.</span>
              </div>
              <div className="flex items-start gap-2">
                <Download size={16} className="mt-0.5 text-primary shrink-0" />
                <span>Export CSV and share your inventory.</span>
              </div>
              <div className="flex items-start gap-2">
                <Recycle size={16} className="mt-0.5 text-primary shrink-0" />
                <span>Learn safe disposal practices for expired medicines.</span>
              </div>
            </div>

            {urgentCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-expired/10 border border-expired/20"
              >
                <ExpiryBadge status="expired" />
                <span className="text-sm font-medium text-foreground">
                  {urgentCount} medicine{urgentCount !== 1 ? 's' : ''} need{urgentCount === 1 ? 's' : ''} attention
                </span>
              </motion.div>
            )}
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 md:py-8 space-y-6">
        {/* Actions row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <AddMedicineDialog onAdd={addMedicine} />
            <DisposalGuideDialog />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search medicines..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 min-h-[44px]"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => exportToCSV(sortedMedicines)}
              className="gap-2 min-h-[44px] shrink-0"
              disabled={medicines.length === 0}
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <FilterBar active={filter} onChange={setFilter} counts={counts} />

        {/* Medicine List */}
        {filtered.length > 0 ? (
          <div className="grid gap-3">
            {filtered.map((med, i) => (
              <MedicineCard key={med.id} medicine={med} onDelete={deleteMedicine} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex p-4 rounded-full bg-muted mb-4">
              <Pill size={32} className="text-muted-foreground" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground">No medicines found</h3>
            <p className="text-muted-foreground mt-1">
              {medicines.length === 0
                ? 'Add your first medicine to start tracking expiry dates.'
                : 'Try adjusting your search or filters.'}
            </p>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>MediTrack — Your personal medicine expiry tracker</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

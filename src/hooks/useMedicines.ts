import { useState, useEffect } from 'react';
import { Medicine } from '@/lib/medicine';

const STORAGE_KEY = 'meditrack-medicines';

const SAMPLE_MEDICINES: Medicine[] = [
  { id: '1', name: 'Paracetamol 500mg', batch: 'A123', quantity: 20, expiryDate: '2026-02-25', addedAt: new Date().toISOString() },
  { id: '2', name: 'Amoxicillin 250mg', batch: 'B456', quantity: 10, expiryDate: '2026-03-15', addedAt: new Date().toISOString() },
  { id: '3', name: 'Ibuprofen 400mg', batch: 'C789', quantity: 8, expiryDate: '2026-02-18', addedAt: new Date().toISOString() },
  { id: '4', name: 'Cetirizine 10mg', batch: 'D012', quantity: 30, expiryDate: '2027-01-10', addedAt: new Date().toISOString() },
  { id: '5', name: 'Vitamin D3', batch: 'E345', quantity: 60, expiryDate: '2026-06-20', addedAt: new Date().toISOString() },
];

export function useMedicines() {
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* ignore */ }
    }
    return SAMPLE_MEDICINES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
  }, [medicines]);

  const addMedicine = (med: Omit<Medicine, 'id' | 'addedAt'>) => {
    const newMed: Medicine = {
      ...med,
      id: crypto.randomUUID(),
      addedAt: new Date().toISOString(),
    };
    setMedicines(prev => [newMed, ...prev]);
  };

  const updateMedicine = (id: string, updates: Partial<Omit<Medicine, 'id' | 'addedAt'>>) => {
    setMedicines(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMedicine = (id: string) => {
    setMedicines(prev => prev.filter(m => m.id !== id));
  };

  return { medicines, addMedicine, updateMedicine, deleteMedicine };
}

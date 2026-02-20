import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Medicine } from '@/lib/medicine';

export function useMedicinesDB() {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedicines = useCallback(async () => {
    if (!user) { setMedicines([]); setLoading(false); return; }
    const { data } = await supabase
      .from('medicines')
      .select('*')
      .eq('user_id', user.id)
      .order('expiry_date', { ascending: true });
    if (data) {
      setMedicines(data.map(d => ({
        id: d.id,
        name: d.name,
        batch: d.batch,
        quantity: d.quantity,
        expiryDate: d.expiry_date,
        addedAt: d.created_at,
        familyMemberId: d.family_member_id,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  const addMedicine = async (med: Omit<Medicine, 'id' | 'addedAt'> & { familyMemberId?: string | null }) => {
    if (!user) return;
    await supabase.from('medicines').insert({
      user_id: user.id,
      name: med.name,
      batch: med.batch,
      quantity: med.quantity,
      expiry_date: med.expiryDate,
      family_member_id: med.familyMemberId || null,
    });
    await fetchMedicines();
  };

  const deleteMedicine = async (id: string) => {
    await supabase.from('medicines').delete().eq('id', id);
    await fetchMedicines();
  };

  return { medicines, loading, addMedicine, deleteMedicine, refetch: fetchMedicines };
}

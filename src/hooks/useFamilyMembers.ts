import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FamilyMember {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export function useFamilyMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!user) { setMembers([]); setLoading(false); return; }
    const { data } = await supabase
      .from('family_members')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true });
    setMembers((data as FamilyMember[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const addMember = async (name: string) => {
    if (!user) return;
    const { error } = await supabase.from('family_members').insert({ owner_id: user.id, name });
    if (!error) await fetchMembers();
    return error;
  };

  const updateMember = async (id: string, name: string) => {
    const { error } = await supabase.from('family_members').update({ name }).eq('id', id);
    if (!error) await fetchMembers();
    return error;
  };

  const deleteMember = async (id: string) => {
    const { error } = await supabase.from('family_members').delete().eq('id', id);
    if (!error) await fetchMembers();
    return error;
  };

  return { members, loading, addMember, updateMember, deleteMember, refetch: fetchMembers };
}

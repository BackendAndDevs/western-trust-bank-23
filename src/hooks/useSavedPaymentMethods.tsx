import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface SavedPaymentMethod {
  id: string;
  user_id: string;
  card_holder_name: string;
  card_last_four: string;
  card_brand: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  nickname: string | null;
  billing_address: string | null;
  created_at: string;
  updated_at: string;
}

export const useSavedPaymentMethods = () => {
  const { user } = useAuth();
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMethods = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('saved_payment_methods' as any)
        .select('*')
        .order('is_default', { ascending: false });
      if (error) throw error;
      setMethods((data as any) || []);
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMethod = async (method: {
    card_holder_name: string;
    card_number: string;
    expiry_month: number;
    expiry_year: number;
    card_brand: string;
    nickname?: string;
    billing_address?: string;
    is_default?: boolean;
  }) => {
    if (!user) return;
    try {
      const lastFour = method.card_number.replace(/\s/g, '').slice(-4);
      
      if (method.is_default) {
        await supabase
          .from('saved_payment_methods' as any)
          .update({ is_default: false } as any)
          .eq('user_id', user.id);
      }

      const { error } = await supabase
        .from('saved_payment_methods' as any)
        .insert({
          user_id: user.id,
          card_holder_name: method.card_holder_name,
          card_last_four: lastFour,
          card_brand: method.card_brand,
          expiry_month: method.expiry_month,
          expiry_year: method.expiry_year,
          nickname: method.nickname || null,
          billing_address: method.billing_address || null,
          is_default: method.is_default || false,
        } as any);

      if (error) throw error;
      toast.success('Payment method saved successfully');
      await fetchMethods();
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      toast.error('Failed to save payment method');
    }
  };

  const removeMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_payment_methods' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Payment method removed');
      await fetchMethods();
    } catch (error: any) {
      toast.error('Failed to remove payment method');
    }
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    try {
      await supabase
        .from('saved_payment_methods' as any)
        .update({ is_default: false } as any)
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('saved_payment_methods' as any)
        .update({ is_default: true } as any)
        .eq('id', id);
      if (error) throw error;
      toast.success('Default payment method updated');
      await fetchMethods();
    } catch (error: any) {
      toast.error('Failed to update default method');
    }
  };

  useEffect(() => {
    if (user) fetchMethods();
  }, [user]);

  return { methods, loading, addMethod, removeMethod, setDefault, refetch: fetchMethods };
};

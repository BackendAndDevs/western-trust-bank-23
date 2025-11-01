import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useInterest = () => {
  const [loading, setLoading] = useState(false);

  const calculateInterest = async (accountId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('calculate_interest', {
        p_account_id: accountId
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; interest_amount?: number };

      if (!result.success) {
        throw new Error(result.error || 'Failed to calculate interest');
      }

      toast.success(`Interest of $${result.interest_amount?.toFixed(2)} applied to your account`);
      return result;
    } catch (error: any) {
      console.error('Error calculating interest:', error);
      toast.error(error.message || 'Failed to calculate interest');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    calculateInterest,
    loading
  };
};

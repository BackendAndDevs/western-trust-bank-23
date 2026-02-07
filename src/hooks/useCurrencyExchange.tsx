import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  spread: number;
  is_active: boolean;
}

export interface CurrencyExchange {
  id: string;
  from_currency: string;
  to_currency: string;
  from_amount: number;
  to_amount: number;
  exchange_rate: number;
  fee_amount: number;
  status: string;
  created_at: string;
}

export const useCurrencyExchange = () => {
  const { user } = useAuth();
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [exchanges, setExchanges] = useState<CurrencyExchange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchRates(), fetchExchanges()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRates = async () => {
    const { data } = await supabase.from('exchange_rates').select('*').eq('is_active', true);
    if (data) setRates(data);
  };

  const fetchExchanges = async () => {
    const { data } = await supabase.from('currency_exchanges').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setExchanges(data);
  };

  const exchangeCurrency = async (accountId: string, fromCurrency: string, toCurrency: string, fromAmount: number) => {
    const { data, error } = await supabase.rpc('exchange_currency', {
      p_account_id: accountId,
      p_from_currency: fromCurrency,
      p_to_currency: toCurrency,
      p_from_amount: fromAmount,
    });
    if (error) return { error };
    await fetchAll();
    return { data };
  };

  const getRate = (from: string, to: string) => rates.find(r => r.from_currency === from && r.to_currency === to);

  const currencies = [...new Set([...rates.map(r => r.from_currency), ...rates.map(r => r.to_currency)])].sort();

  return { rates, exchanges, loading, currencies, exchangeCurrency, getRate, refetch: fetchAll };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  asset_type: string;
  current_price: number;
  previous_price: number;
  currency: string;
  is_active: boolean;
}

export interface PortfolioHolding {
  id: string;
  user_id: string;
  asset_id: string;
  quantity: number;
  average_buy_price: number;
  asset?: Asset;
}

export interface PortfolioTransaction {
  id: string;
  user_id: string;
  asset_id: string;
  account_id: string;
  transaction_type: string;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  fee_amount: number;
  status: string;
  created_at: string;
  asset?: Asset;
}

export const usePortfolio = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [transactions, setTransactions] = useState<PortfolioTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchAssets(), fetchHoldings(), fetchTransactions()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    const { data } = await supabase.from('assets').select('*').eq('is_active', true).order('asset_type').order('symbol');
    if (data) setAssets(data);
  };

  const fetchHoldings = async () => {
    const { data } = await supabase.from('portfolio_holdings').select('*, asset:assets(*)').order('created_at', { ascending: false });
    if (data) setHoldings(data.map((h: any) => ({ ...h, asset: h.asset })));
  };

  const fetchTransactions = async () => {
    const { data } = await supabase.from('portfolio_transactions').select('*, asset:assets(*)').order('created_at', { ascending: false }).limit(50);
    if (data) setTransactions(data.map((t: any) => ({ ...t, asset: t.asset })));
  };

  const buyAsset = async (accountId: string, assetId: string, quantity: number) => {
    const { data, error } = await supabase.rpc('buy_asset', {
      p_account_id: accountId,
      p_asset_id: assetId,
      p_quantity: quantity,
    });
    if (error) return { error };
    await fetchAll();
    return { data };
  };

  const sellAsset = async (accountId: string, assetId: string, quantity: number) => {
    const { data, error } = await supabase.rpc('sell_asset', {
      p_account_id: accountId,
      p_asset_id: assetId,
      p_quantity: quantity,
    });
    if (error) return { error };
    await fetchAll();
    return { data };
  };

  const totalValue = holdings.reduce((sum, h) => {
    const asset = assets.find(a => a.id === h.asset_id) || h.asset;
    return sum + (asset ? asset.current_price * h.quantity : 0);
  }, 0);

  const totalCost = holdings.reduce((sum, h) => sum + h.average_buy_price * h.quantity, 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  return {
    assets, holdings, transactions, loading, totalValue, totalCost,
    totalGainLoss, totalGainLossPercent, buyAsset, sellAsset, refetch: fetchAll,
  };
};

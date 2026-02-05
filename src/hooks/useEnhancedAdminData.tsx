 import { useState, useEffect } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useAuth } from '@/contexts/AuthContext';
 
 export interface DashboardStats {
   total_users: number;
   total_accounts: number;
   total_balance: number;
   pending_transactions: number;
   pending_loans: number;
   pending_external_transfers: number;
   pending_wire_transfers: number;
   pending_check_deposits: number;
   pending_beneficiaries: number;
   total_cards: number;
   frozen_cards: number;
   active_recurring_transfers: number;
   pending_bills: number;
   today_transactions: number;
 }
 
 export interface ExternalTransferAdmin {
   id: string;
   user_id: string;
   from_account_id: string;
   bank_id: string;
   bank_name: string;
   recipient_name: string;
   recipient_account_number: string;
   amount: number;
   memo: string;
   status: string;
   created_at: string;
   user_email: string;
   user_name: string;
   account_number: string;
 }
 
 export interface WireTransferAdmin {
   id: string;
   user_id: string;
   wire_type: string;
   recipient_name: string;
   recipient_bank: string;
   amount: number;
   currency: string;
   fee_amount: number;
   status: string;
   purpose: string;
   created_at: string;
   user_email: string;
   user_name: string;
   account_number: string;
 }
 
 export interface CheckDepositAdmin {
   id: string;
   user_id: string;
   account_id: string;
   check_number: string;
   check_amount: number;
   payer_name: string;
   status: string;
   hold_days: number;
   created_at: string;
   user_email: string;
   user_name: string;
   account_number: string;
 }
 
 export interface CardAdmin {
   id: string;
   user_id: string;
   account_id: string;
   card_number: string;
   card_type: string;
   card_status: string;
   expiry_date: string;
   daily_limit: number;
   is_contactless: boolean;
   created_at: string;
   user_email: string;
   user_name: string;
   account_number: string;
 }
 
 export interface BeneficiaryAdmin {
   id: string;
   user_id: string;
   nickname: string;
   account_number: string;
   bank_name: string;
   beneficiary_type: string;
   is_verified: boolean;
   status: string;
   created_at: string;
   user_email: string;
   user_name: string;
 }
 
 export const useEnhancedAdminData = () => {
   const { user } = useAuth();
   const [stats, setStats] = useState<DashboardStats | null>(null);
   const [externalTransfers, setExternalTransfers] = useState<ExternalTransferAdmin[]>([]);
   const [wireTransfers, setWireTransfers] = useState<WireTransferAdmin[]>([]);
   const [checkDeposits, setCheckDeposits] = useState<CheckDepositAdmin[]>([]);
   const [cards, setCards] = useState<CardAdmin[]>([]);
   const [beneficiaries, setBeneficiaries] = useState<BeneficiaryAdmin[]>([]);
   const [loading, setLoading] = useState(true);
 
   useEffect(() => {
     if (user) {
       fetchAllData();
     }
   }, [user]);
 
   const fetchAllData = async () => {
     if (!user) return;
     setLoading(true);
     try {
       await Promise.all([
         fetchStats(),
         fetchExternalTransfers(),
         fetchWireTransfers(),
         fetchCheckDeposits(),
         fetchCards(),
         fetchBeneficiaries()
       ]);
     } catch (error) {
       console.error('Error fetching enhanced admin data:', error);
     } finally {
       setLoading(false);
     }
   };
 
   const fetchStats = async () => {
     try {
       const { data, error } = await supabase.rpc('admin_get_dashboard_stats');
       if (error) throw error;
       setStats(data as unknown as DashboardStats);
     } catch (error) {
       console.error('Error fetching stats:', error);
     }
   };
 
   const fetchExternalTransfers = async () => {
     try {
       const { data, error } = await supabase.rpc('admin_get_all_external_transfers');
       if (error) throw error;
       setExternalTransfers((data as ExternalTransferAdmin[]) || []);
     } catch (error) {
       console.error('Error fetching external transfers:', error);
     }
   };
 
   const fetchWireTransfers = async () => {
     try {
       const { data, error } = await supabase.rpc('admin_get_all_wire_transfers');
       if (error) throw error;
       setWireTransfers((data as WireTransferAdmin[]) || []);
     } catch (error) {
       console.error('Error fetching wire transfers:', error);
     }
   };
 
   const fetchCheckDeposits = async () => {
     try {
       const { data, error } = await supabase.rpc('admin_get_all_check_deposits');
       if (error) throw error;
       setCheckDeposits((data as CheckDepositAdmin[]) || []);
     } catch (error) {
       console.error('Error fetching check deposits:', error);
     }
   };
 
   const fetchCards = async () => {
     try {
       const { data, error } = await supabase.rpc('admin_get_all_cards');
       if (error) throw error;
       setCards((data as CardAdmin[]) || []);
     } catch (error) {
       console.error('Error fetching cards:', error);
     }
   };
 
   const fetchBeneficiaries = async () => {
     try {
       const { data, error } = await supabase.rpc('admin_get_all_beneficiaries');
       if (error) throw error;
       setBeneficiaries((data as BeneficiaryAdmin[]) || []);
     } catch (error) {
       console.error('Error fetching beneficiaries:', error);
     }
   };
 
   const processExternalTransfer = async (transferId: string, status: 'approved' | 'rejected', notes?: string) => {
     try {
       const { error } = await supabase.rpc('admin_process_external_transfer', {
         transfer_id: transferId,
         new_status: status,
         admin_notes: notes
       });
       if (error) throw error;
       await fetchAllData();
       return { error: null };
     } catch (error) {
       return { error };
     }
   };
 
   const processWireTransfer = async (transferId: string, status: 'approved' | 'rejected', notes?: string) => {
     try {
       const { error } = await supabase.rpc('admin_process_wire_transfer', {
         transfer_id: transferId,
         new_status: status,
         admin_notes: notes
       });
       if (error) throw error;
       await fetchAllData();
       return { error: null };
     } catch (error) {
       return { error };
     }
   };
 
   const processCheckDeposit = async (depositId: string, status: 'approved' | 'rejected' | 'cleared', notes?: string) => {
     try {
       const { error } = await supabase.rpc('admin_process_check_deposit', {
         deposit_id: depositId,
         new_status: status,
         admin_notes: notes
       });
       if (error) throw error;
       await fetchAllData();
       return { error: null };
     } catch (error) {
       return { error };
     }
   };
 
   const updateCardStatus = async (cardId: string, status: string) => {
     try {
       const { error } = await supabase.rpc('admin_update_card_status', {
         card_id: cardId,
         new_status: status
       });
       if (error) throw error;
       await fetchAllData();
       return { error: null };
     } catch (error) {
       return { error };
     }
   };
 
   const verifyBeneficiary = async (beneficiaryId: string, status: 'active' | 'suspended') => {
     try {
       const { error } = await supabase.rpc('admin_verify_beneficiary', {
         beneficiary_id: beneficiaryId,
         new_status: status
       });
       if (error) throw error;
       await fetchAllData();
       return { error: null };
     } catch (error) {
       return { error };
     }
   };
 
   // Computed values
   const pendingExternalTransfers = externalTransfers.filter(t => t.status === 'pending');
   const pendingWireTransfers = wireTransfers.filter(t => t.status === 'pending');
   const pendingCheckDeposits = checkDeposits.filter(d => d.status === 'pending');
   const pendingBeneficiaries = beneficiaries.filter(b => b.status === 'pending');
 
   return {
     stats,
     externalTransfers,
     wireTransfers,
     checkDeposits,
     cards,
     beneficiaries,
     pendingExternalTransfers,
     pendingWireTransfers,
     pendingCheckDeposits,
     pendingBeneficiaries,
     loading,
     processExternalTransfer,
     processWireTransfer,
     processCheckDeposit,
     updateCardStatus,
     verifyBeneficiary,
     refetchData: fetchAllData
   };
 };
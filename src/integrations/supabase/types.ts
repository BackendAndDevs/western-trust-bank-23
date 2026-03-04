export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      account_statements: {
        Row: {
          account_id: string
          closing_balance: number
          created_at: string
          id: string
          opening_balance: number
          period_end: string
          period_start: string
          statement_date: string
          statement_url: string | null
          total_deposits: number | null
          total_withdrawals: number | null
          user_id: string
        }
        Insert: {
          account_id: string
          closing_balance: number
          created_at?: string
          id?: string
          opening_balance: number
          period_end: string
          period_start: string
          statement_date: string
          statement_url?: string | null
          total_deposits?: number | null
          total_withdrawals?: number | null
          user_id: string
        }
        Update: {
          account_id?: string
          closing_balance?: number
          created_at?: string
          id?: string
          opening_balance?: number
          period_end?: string
          period_start?: string
          statement_date?: string
          statement_url?: string | null
          total_deposits?: number | null
          total_withdrawals?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_statements_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          account_number: string
          account_type: string
          balance: number
          created_at: string
          currency: string
          id: string
          interest_rate: number | null
          is_primary: boolean
          last_interest_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          account_type?: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          interest_rate?: number | null
          is_primary?: boolean
          last_interest_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          account_type?: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          interest_rate?: number | null
          is_primary?: boolean
          last_interest_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action_type: string
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          asset_type: string
          created_at: string
          currency: string
          current_price: number
          id: string
          is_active: boolean
          name: string
          previous_price: number
          symbol: string
          updated_at: string
        }
        Insert: {
          asset_type?: string
          created_at?: string
          currency?: string
          current_price?: number
          id?: string
          is_active?: boolean
          name: string
          previous_price?: number
          symbol: string
          updated_at?: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          currency?: string
          current_price?: number
          id?: string
          is_active?: boolean
          name?: string
          previous_price?: number
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      beneficiaries: {
        Row: {
          account_number: string
          bank_id: string | null
          bank_name: string | null
          beneficiary_type: string
          created_at: string
          id: string
          is_verified: boolean | null
          nickname: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          bank_id?: string | null
          bank_name?: string | null
          beneficiary_type?: string
          created_at?: string
          id?: string
          is_verified?: boolean | null
          nickname: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          bank_id?: string | null
          bank_name?: string | null
          beneficiary_type?: string
          created_at?: string
          id?: string
          is_verified?: boolean | null
          nickname?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "us_banks"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          account_number: string
          amount: number
          auto_pay: boolean
          biller_name: string
          category: string
          created_at: string
          due_date: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          amount: number
          auto_pay?: boolean
          biller_name: string
          category: string
          created_at?: string
          due_date: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          amount?: number
          auto_pay?: boolean
          biller_name?: string
          category?: string
          created_at?: string
          due_date?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          account_id: string
          card_number: string
          card_status: string
          card_type: string
          created_at: string
          daily_limit: number | null
          expiry_date: string
          id: string
          is_contactless: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          card_number: string
          card_status?: string
          card_type?: string
          created_at?: string
          daily_limit?: number | null
          expiry_date: string
          id?: string
          is_contactless?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          card_number?: string
          card_status?: string
          card_type?: string
          created_at?: string
          daily_limit?: number | null
          expiry_date?: string
          id?: string
          is_contactless?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_type: string
          session_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id: string
          sender_type?: string
          session_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          sender_type?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          closed_at: string | null
          created_at: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      check_deposits: {
        Row: {
          account_id: string
          admin_notes: string | null
          available_date: string | null
          back_image_url: string | null
          check_amount: number
          check_number: string
          created_at: string
          front_image_url: string | null
          hold_days: number | null
          id: string
          payer_bank: string | null
          payer_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          admin_notes?: string | null
          available_date?: string | null
          back_image_url?: string | null
          check_amount: number
          check_number: string
          created_at?: string
          front_image_url?: string | null
          hold_days?: number | null
          id?: string
          payer_bank?: string | null
          payer_name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          admin_notes?: string | null
          available_date?: string | null
          back_image_url?: string | null
          check_amount?: number
          check_number?: string
          created_at?: string
          front_image_url?: string | null
          hold_days?: number | null
          id?: string
          payer_bank?: string | null
          payer_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_deposits_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      currency_exchanges: {
        Row: {
          account_id: string
          created_at: string
          exchange_rate: number
          fee_amount: number
          from_amount: number
          from_currency: string
          id: string
          status: string
          to_amount: number
          to_currency: string
          user_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          exchange_rate: number
          fee_amount?: number
          from_amount: number
          from_currency: string
          id?: string
          status?: string
          to_amount: number
          to_currency: string
          user_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          exchange_rate?: number
          fee_amount?: number
          from_amount?: number
          from_currency?: string
          id?: string
          status?: string
          to_amount?: number
          to_currency?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "currency_exchanges_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          from_currency: string
          id: string
          is_active: boolean
          rate: number
          spread: number
          to_currency: string
          updated_at: string
        }
        Insert: {
          from_currency: string
          id?: string
          is_active?: boolean
          rate: number
          spread?: number
          to_currency: string
          updated_at?: string
        }
        Update: {
          from_currency?: string
          id?: string
          is_active?: boolean
          rate?: number
          spread?: number
          to_currency?: string
          updated_at?: string
        }
        Relationships: []
      }
      external_transfers: {
        Row: {
          amount: number
          bank_id: string
          created_at: string
          from_account_id: string
          id: string
          memo: string | null
          recipient_account_number: string
          recipient_name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_id: string
          created_at?: string
          from_account_id: string
          id?: string
          memo?: string | null
          recipient_account_number: string
          recipient_name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_id?: string
          created_at?: string
          from_account_id?: string
          id?: string
          memo?: string | null
          recipient_account_number?: string
          recipient_name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "external_transfers_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "us_banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          annual_income: number | null
          created_at: string
          credit_score: number | null
          employment_status: string | null
          id: string
          loan_type: string
          purpose: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          annual_income?: number | null
          created_at?: string
          credit_score?: number | null
          employment_status?: string | null
          id?: string
          loan_type: string
          purpose: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          annual_income?: number | null
          created_at?: string
          credit_score?: number | null
          employment_status?: string | null
          id?: string
          loan_type?: string
          purpose?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolio_holdings: {
        Row: {
          asset_id: string
          average_buy_price: number
          created_at: string
          id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_id: string
          average_buy_price?: number
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_id?: string
          average_buy_price?: number
          created_at?: string
          id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_holdings_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_transactions: {
        Row: {
          account_id: string
          asset_id: string
          created_at: string
          fee_amount: number
          id: string
          price_per_unit: number
          quantity: number
          status: string
          total_amount: number
          transaction_type: string
          user_id: string
        }
        Insert: {
          account_id: string
          asset_id: string
          created_at?: string
          fee_amount?: number
          id?: string
          price_per_unit: number
          quantity: number
          status?: string
          total_amount: number
          transaction_type: string
          user_id: string
        }
        Update: {
          account_id?: string
          asset_id?: string
          created_at?: string
          fee_amount?: number
          id?: string
          price_per_unit?: number
          quantity?: number
          status?: string
          total_amount?: number
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_transactions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string
          account_type: string
          address: string | null
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string
          account_type?: string
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string
          account_type?: string
          address?: string | null
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_transfers: {
        Row: {
          active: boolean
          amount: number
          created_at: string
          frequency: string
          from_account_id: string
          id: string
          memo: string | null
          next_execution_date: string
          to_account_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          amount: number
          created_at?: string
          frequency: string
          from_account_id: string
          id?: string
          memo?: string | null
          next_execution_date: string
          to_account_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          amount?: number
          created_at?: string
          frequency?: string
          from_account_id?: string
          id?: string
          memo?: string | null
          next_execution_date?: string
          to_account_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_payment_methods: {
        Row: {
          billing_address: string | null
          card_brand: string
          card_holder_name: string
          card_last_four: string
          created_at: string
          expiry_month: number
          expiry_year: number
          id: string
          is_default: boolean
          nickname: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: string | null
          card_brand?: string
          card_holder_name: string
          card_last_four: string
          created_at?: string
          expiry_month: number
          expiry_year: number
          id?: string
          is_default?: boolean
          nickname?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: string | null
          card_brand?: string
          card_holder_name?: string
          card_last_four?: string
          created_at?: string
          expiry_month?: number
          expiry_year?: number
          id?: string
          is_default?: boolean
          nickname?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      security_settings: {
        Row: {
          account_locked: boolean | null
          created_at: string
          failed_login_attempts: number | null
          id: string
          large_transaction_alert: number | null
          last_password_change: string | null
          locked_until: string | null
          login_notifications: boolean | null
          transaction_notifications: boolean | null
          trusted_devices: Json | null
          two_factor_enabled: boolean | null
          two_factor_method: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_locked?: boolean | null
          created_at?: string
          failed_login_attempts?: number | null
          id?: string
          large_transaction_alert?: number | null
          last_password_change?: string | null
          locked_until?: string | null
          login_notifications?: boolean | null
          transaction_notifications?: boolean | null
          trusted_devices?: Json | null
          two_factor_enabled?: boolean | null
          two_factor_method?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_locked?: boolean | null
          created_at?: string
          failed_login_attempts?: number | null
          id?: string
          large_transaction_alert?: number | null
          last_password_change?: string | null
          locked_until?: string | null
          login_notifications?: boolean | null
          transaction_notifications?: boolean | null
          trusted_devices?: Json | null
          two_factor_enabled?: boolean | null
          two_factor_method?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_type: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id: string
          sender_type?: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          sender_type?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          admin_notes: string | null
          amount: number
          created_at: string
          description: string | null
          id: string
          recipient_account_id: string | null
          recipient_info: Json | null
          status: string
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          admin_notes?: string | null
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          recipient_account_id?: string | null
          recipient_info?: Json | null
          status?: string
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          admin_notes?: string | null
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          recipient_account_id?: string | null
          recipient_info?: Json | null
          status?: string
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_recipient_account_id_fkey"
            columns: ["recipient_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      us_banks: {
        Row: {
          bank_name: string
          created_at: string
          id: string
          routing_number: string
          swift_code: string | null
        }
        Insert: {
          bank_name: string
          created_at?: string
          id?: string
          routing_number: string
          swift_code?: string | null
        }
        Update: {
          bank_name?: string
          created_at?: string
          id?: string
          routing_number?: string
          swift_code?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      wire_transfers: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          currency: string
          fee_amount: number | null
          from_account_id: string
          iban: string | null
          id: string
          purpose: string | null
          recipient_account: string
          recipient_bank: string
          recipient_name: string
          reference_number: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          routing_number: string | null
          status: string
          swift_code: string | null
          updated_at: string
          user_id: string
          wire_type: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          currency?: string
          fee_amount?: number | null
          from_account_id: string
          iban?: string | null
          id?: string
          purpose?: string | null
          recipient_account: string
          recipient_bank: string
          recipient_name: string
          reference_number?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          routing_number?: string | null
          status?: string
          swift_code?: string | null
          updated_at?: string
          user_id: string
          wire_type: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          currency?: string
          fee_amount?: number | null
          from_account_id?: string
          iban?: string | null
          id?: string
          purpose?: string | null
          recipient_account?: string
          recipient_bank?: string
          recipient_name?: string
          reference_number?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          routing_number?: string | null
          status?: string
          swift_code?: string | null
          updated_at?: string
          user_id?: string
          wire_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wire_transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_user: {
        Args: {
          email: string
          full_name: string
          initial_balance?: number
          password: string
          user_role?: string
        }
        Returns: Json
      }
      admin_delete_user: { Args: { target_user_id: string }; Returns: Json }
      admin_get_all_accounts: {
        Args: never
        Returns: {
          account_number: string
          account_type: string
          balance: number
          created_at: string
          currency: string
          id: string
          is_primary: boolean
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      admin_get_all_beneficiaries: {
        Args: never
        Returns: {
          account_number: string
          bank_name: string
          beneficiary_type: string
          created_at: string
          id: string
          is_verified: boolean
          nickname: string
          status: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      admin_get_all_bills: {
        Args: never
        Returns: {
          amount: number
          auto_pay: boolean
          biller_name: string
          category: string
          created_at: string
          due_date: string
          id: string
          status: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      admin_get_all_cards: {
        Args: never
        Returns: {
          account_id: string
          account_number: string
          card_number: string
          card_status: string
          card_type: string
          created_at: string
          daily_limit: number
          expiry_date: string
          id: string
          is_contactless: boolean
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      admin_get_all_chat_sessions: {
        Args: never
        Returns: {
          closed_at: string
          created_at: string
          id: string
          message_count: number
          status: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      admin_get_all_check_deposits: {
        Args: never
        Returns: {
          account_id: string
          account_number: string
          check_amount: number
          check_number: string
          created_at: string
          hold_days: number
          id: string
          payer_name: string
          status: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      admin_get_all_external_transfers: {
        Args: never
        Returns: {
          account_number: string
          amount: number
          bank_id: string
          bank_name: string
          created_at: string
          from_account_id: string
          id: string
          memo: string
          recipient_account_number: string
          recipient_name: string
          status: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      admin_get_all_loans: {
        Args: never
        Returns: {
          admin_notes: string
          amount: number
          annual_income: number
          created_at: string
          credit_score: number
          employment_status: string
          id: string
          loan_type: string
          purpose: string
          reviewed_at: string
          reviewed_by: string
          status: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      admin_get_all_recurring_transfers: {
        Args: never
        Returns: {
          account_number: string
          active: boolean
          amount: number
          created_at: string
          frequency: string
          from_account_id: string
          id: string
          memo: string
          next_execution_date: string
          to_account_number: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      admin_get_all_tickets: {
        Args: never
        Returns: {
          category: string
          created_at: string
          id: string
          message_count: number
          priority: string
          status: string
          subject: string
          updated_at: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      admin_get_all_transactions: {
        Args: never
        Returns: {
          account_id: string
          account_number: string
          amount: number
          created_at: string
          description: string
          id: string
          recipient_account_id: string
          recipient_info: Json
          status: string
          transaction_type: string
          user_email: string
          user_id: string
          user_name: string
        }[]
      }
      admin_get_all_users: {
        Args: never
        Returns: {
          account_count: number
          account_status: string
          created_at: string
          email: string
          full_name: string
          total_balance: number
          user_id: string
        }[]
      }
      admin_get_all_wire_transfers: {
        Args: never
        Returns: {
          account_number: string
          amount: number
          created_at: string
          currency: string
          fee_amount: number
          id: string
          purpose: string
          recipient_bank: string
          recipient_name: string
          status: string
          user_email: string
          user_id: string
          user_name: string
          wire_type: string
        }[]
      }
      admin_get_chat_messages: {
        Args: { p_session_id: string }
        Returns: {
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_name: string
          sender_type: string
        }[]
      }
      admin_get_dashboard_stats: { Args: never; Returns: Json }
      admin_get_ticket_messages: {
        Args: { p_ticket_id: string }
        Returns: {
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_name: string
          sender_type: string
        }[]
      }
      admin_process_check_deposit: {
        Args: { admin_notes?: string; deposit_id: string; new_status: string }
        Returns: Json
      }
      admin_process_external_transfer: {
        Args: { admin_notes?: string; new_status: string; transfer_id: string }
        Returns: Json
      }
      admin_process_transaction: {
        Args: {
          admin_notes?: string
          new_status: string
          transaction_id: string
        }
        Returns: Json
      }
      admin_process_wire_transfer: {
        Args: { admin_notes?: string; new_status: string; transfer_id: string }
        Returns: Json
      }
      admin_review_loan: {
        Args: { admin_notes?: string; loan_id: string; new_status: string }
        Returns: Json
      }
      admin_send_chat_message: {
        Args: { p_message: string; p_session_id: string }
        Returns: Json
      }
      admin_send_ticket_message: {
        Args: { p_message: string; p_ticket_id: string }
        Returns: Json
      }
      admin_update_account_balance: {
        Args: {
          admin_notes?: string
          new_balance: number
          target_account_id: string
        }
        Returns: Json
      }
      admin_update_account_status: {
        Args: {
          admin_notes?: string
          new_status: string
          target_user_id: string
        }
        Returns: Json
      }
      admin_update_asset_price: {
        Args: { p_asset_id: string; p_new_price: number }
        Returns: Json
      }
      admin_update_card_status: {
        Args: { card_id: string; new_status: string }
        Returns: Json
      }
      admin_update_exchange_rate: {
        Args: { p_new_rate: number; p_rate_id: string }
        Returns: Json
      }
      admin_update_ticket_status: {
        Args: { p_status: string; p_ticket_id: string }
        Returns: Json
      }
      admin_verify_beneficiary: {
        Args: { beneficiary_id: string; new_status: string }
        Returns: Json
      }
      buy_asset: {
        Args: { p_account_id: string; p_asset_id: string; p_quantity: number }
        Returns: Json
      }
      calculate_interest: { Args: { p_account_id: string }; Returns: Json }
      exchange_currency: {
        Args: {
          p_account_id: string
          p_from_amount: number
          p_from_currency: string
          p_to_currency: string
        }
        Returns: Json
      }
      generate_account_number: { Args: never; Returns: string }
      get_notifications: {
        Args: { p_limit?: number }
        Returns: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
        }[]
      }
      has_role: {
        Args: { p_role: string; p_user_id: string }
        Returns: boolean
      }
      mark_notification_read: {
        Args: { p_notification_id: string }
        Returns: boolean
      }
      pay_bill: {
        Args: { p_account_id: string; p_bill_id: string }
        Returns: Json
      }
      process_external_transfer: {
        Args: {
          p_amount: number
          p_bank_id: string
          p_from_account_id: string
          p_memo?: string
          p_recipient_account_number: string
          p_recipient_name: string
        }
        Returns: Json
      }
      sell_asset: {
        Args: { p_account_id: string; p_asset_id: string; p_quantity: number }
        Returns: Json
      }
      setup_recurring_transfer: {
        Args: {
          p_amount: number
          p_frequency: string
          p_from_account_id: string
          p_memo?: string
          p_to_account_number: string
        }
        Returns: Json
      }
      update_card_status: {
        Args: { p_card_id: string; p_status: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

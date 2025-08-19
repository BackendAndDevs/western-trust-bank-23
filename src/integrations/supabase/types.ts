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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_number: string
          account_type: string
          balance: number
          created_at: string
          currency: string
          id: string
          is_primary: boolean | null
          modified_at: string | null
          modified_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          account_type: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          is_primary?: boolean | null
          modified_at?: string | null
          modified_by?: string | null
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
          is_primary?: boolean | null
          modified_at?: string | null
          modified_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          account_id: string
          card_number: string
          card_status: string | null
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
          card_status?: string | null
          card_type: string
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
          card_status?: string | null
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
          status: string | null
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
          status?: string | null
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
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_status: string | null
          account_type: string | null
          address: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string
          id: string
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_status?: string | null
          account_type?: string | null
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name: string
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_status?: string | null
          account_type?: string | null
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          created_at: string
          currency: string
          description: string
          id: string
          recipient_account_id: string | null
          recipient_info: Json | null
          reference_number: string | null
          status: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string
          currency?: string
          description: string
          id?: string
          recipient_account_id?: string | null
          recipient_info?: Json | null
          reference_number?: string | null
          status?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string
          currency?: string
          description?: string
          id?: string
          recipient_account_id?: string | null
          recipient_info?: Json | null
          reference_number?: string | null
          status?: string | null
          transaction_type?: string
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
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
      admin_get_all_accounts: {
        Args: Record<PropertyKey, never>
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
      admin_get_all_loans: {
        Args: Record<PropertyKey, never>
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
      admin_get_all_transactions: {
        Args: Record<PropertyKey, never>
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
      admin_process_transaction: {
        Args: {
          admin_notes?: string
          new_status: string
          transaction_id: string
        }
        Returns: undefined
      }
      admin_review_loan: {
        Args: { admin_notes?: string; loan_id: string; new_status: string }
        Returns: undefined
      }
      admin_update_account_balance: {
        Args: {
          admin_notes?: string
          new_balance: number
          target_account_id: string
        }
        Returns: undefined
      }
      generate_account_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_card_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: { _role: string; _user_id: string }
        Returns: boolean
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

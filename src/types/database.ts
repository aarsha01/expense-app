export interface Database {
  public: {
    Tables: {
      expense_data: {
        Row: {
          id: string;
          user_id: string;
          period1_months: Json;
          period2_months: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          period1_months: Json;
          period2_months: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          period1_months?: Json;
          period2_months?: Json;
          updated_at?: string;
        };
      };
    };
  };
}

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ExpenseDataRow = Database['public']['Tables']['expense_data']['Row'];

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          name: string
          code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          store_id: string
          tracking_number: string | null
          order_id: string
          sku: string
          shipped_quantity: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          tracking_number?: string | null
          order_id: string
          sku: string
          shipped_quantity: number
          status: string
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          tracking_number?: string | null
          order_id?: string
          sku?: string
          shipped_quantity?: number
          status?: string
          created_at?: string
        }
      }
      items: {
        Row: {
          id: string
          order_id: string
          condition: string
          notes: string | null
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          condition: string
          notes?: string | null
          processed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          condition?: string
          notes?: string | null
          processed_at?: string | null
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'manager' | 'employee'
          permissions: Json
          store_ids: string[]
          managed_stores: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'manager' | 'employee'
          permissions?: Json
          store_ids?: string[]
          managed_stores?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'manager' | 'employee'
          permissions?: Json
          store_ids?: string[]
          managed_stores?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
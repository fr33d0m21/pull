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
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          role: string
          permissions: Json
          store_ids: string[]
          managed_stores: string[]
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: string
          permissions?: Json
          store_ids?: string[]
          managed_stores?: string[]
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          permissions?: Json
          store_ids?: string[]
          managed_stores?: string[]
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      spreadsheets: {
        Row: {
          id: string
          name: string
          file_name: string
          row_count: number
          status: string
          store_id: string
          uploaded_by: string
          type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          file_name: string
          row_count?: number
          status?: string
          store_id: string
          uploaded_by: string
          type: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          file_name?: string
          row_count?: number
          status?: string
          store_id?: string
          uploaded_by?: string
          type?: string
          created_at?: string
          updated_at?: string
        }
      }
      items: {
        Row: {
          id: string
          store_id: string
          spreadsheet_id: string
          sku: string
          fnsku: string | null
          disposition: string | null
          shipped_quantity: number
          requested_quantity: number
          actual_return_qty: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          spreadsheet_id: string
          sku: string
          fnsku?: string | null
          disposition?: string | null
          shipped_quantity: number
          requested_quantity: number
          actual_return_qty?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          spreadsheet_id?: string
          sku?: string
          fnsku?: string | null
          disposition?: string | null
          shipped_quantity?: number
          requested_quantity?: number
          actual_return_qty?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      pullback_items: {
        Row: {
          id: string
          item_id: string
          spreadsheet_id: string
          store_id: string
          request_date: string
          order_id: string
          shipment_date: string
          carrier: string | null
          tracking_number: string | null
          removal_order_type: string | null
          processing_status: string
          notes: string | null
          tracking_numbers: string[]
          carriers: string[]
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_id: string
          spreadsheet_id: string
          store_id: string
          request_date: string
          order_id: string
          shipment_date: string
          carrier?: string | null
          tracking_number?: string | null
          removal_order_type?: string | null
          processing_status?: string
          notes?: string | null
          tracking_numbers?: string[]
          carriers?: string[]
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          spreadsheet_id?: string
          store_id?: string
          request_date?: string
          order_id?: string
          shipment_date?: string
          carrier?: string | null
          tracking_number?: string | null
          removal_order_type?: string | null
          processing_status?: string
          notes?: string | null
          tracking_numbers?: string[]
          carriers?: string[]
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          item_id: string
          store_id: string
          spreadsheet_id: string
          order_id: string
          processing_status: string
          processing_date: string
          tracking_numbers: string[]
          carriers: string[]
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          item_id: string
          store_id: string
          spreadsheet_id: string
          order_id: string
          processing_status?: string
          processing_date: string
          tracking_numbers?: string[]
          carriers?: string[]
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          store_id?: string
          spreadsheet_id?: string
          order_id?: string
          processing_status?: string
          processing_date?: string
          tracking_numbers?: string[]
          carriers?: string[]
          notes?: string | null
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
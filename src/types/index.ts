import type { Database } from './supabase';

// Base types
export interface ShipmentInfo {
  id: string;
  carrier: string;
  trackingNumber: string;
  date: string;
  notes?: string;
  itemIds?: string[];
}

export type UserRole = 'admin' | 'manager' | 'employee';

export interface UserPermissions {
  manageUsers?: boolean;
  manageStores?: boolean;
  viewAllStores?: boolean;
  editAllStores?: boolean;
  viewDashboard?: boolean;
  viewSpreadsheet?: boolean;
  processOrders?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  managed_stores?: string[];
  store_ids?: string[];
  permissions?: UserPermissions;
}

export interface Store {
  id: string;
  name: string;
  code: string;
  created_by?: string;
  created_at?: string;
}

// Dashboard item (from items table)
export type DashboardItem = Database['public']['Tables']['items']['Row'];

// Working item (from pullback_items table with item relation)
export type WorkingItem = Database['public']['Tables']['pullback_items']['Row'] & {
  item?: DashboardItem;
  actual_return_qty: number;
};

// Completed order (from orders table with item relation)
export type CompletedOrder = Database['public']['Tables']['orders']['Row'] & {
  item?: DashboardItem;
};

// Stats
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalItems: number;
  receivedItems: number;
}

// Store context
export interface StoreContextType {
  currentStore: Store | null;
  setCurrentStore: (store: Store | null) => void;
  stores: Store[];
  addStore: (store: Pick<Store, 'name' | 'code'>) => Promise<Store | undefined>;
  updateStore: (store: Store) => Promise<void>;
  removeStore: (storeId: string) => Promise<void>;
}

// Data context
export interface DataContext {
  // Data
  dashboardItems: DashboardItem[];
  workingItems: WorkingItem[];
  completedOrders: CompletedOrder[];
  stats: DashboardStats;
  
  // State
  isLoading: boolean;
  
  // Actions
  processOrder: (orderId: string, data: Partial<WorkingItem>) => Promise<void>;
  loadStoreData: () => Promise<void>;
}
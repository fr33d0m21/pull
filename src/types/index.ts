// Add to existing types
export interface ShipmentInfo {
  id: string;
  carrier: string;
  trackingNumber: string;
  date: string;
  notes?: string;
  itemIds?: string[]; // Links shipment to specific items
}

export type UserRole = 'admin' | 'manager' | 'employee';

export interface UserPermissions {
  manage_users?: boolean;
  manage_stores?: boolean;
  view_all_stores?: boolean;
  edit_all_stores?: boolean;
  viewDashboard?: boolean;
  viewSpreadsheet?: boolean;
  processOrders?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  store_ids?: string[];
  managed_stores?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Store {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface ItemDiscrepancy {
  id: string;
  type: 'damage' | 'mislabel' | 'wrong-item' | 'other';
  description: string;
  quantity: number;
  images?: string[];
}

// Update OrderItem interface
export interface OrderItem {
  id: string;
  sku: string;
  fnsku: string;
  expectedQuantity?: number;
  receivedQuantity?: number;
  condition: 'Sellable' | 'Unsellable' | 'Missing';
  notes?: string;
  images?: string[];
  discrepancies?: ItemDiscrepancy[];
  shipments?: ShipmentInfo[]; // Add shipments to items
}
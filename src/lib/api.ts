import { supabase } from './supabase';
import type { Database } from '../types/supabase';

type Store = Database['public']['Tables']['stores']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type Item = Database['public']['Tables']['items']['Row'];

// Store Operations
export async function getStores() {
  return await supabase.from('stores').select('*');
}

export async function createStore(store: Omit<Store, 'id' | 'created_at'>) {
  return await supabase.from('stores').insert(store);
}

export async function updateStore(id: string, updates: Partial<Store>) {
  return await supabase.from('stores').update(updates).eq('id', id);
}

// Order Operations
export async function getOrders(storeId: string) {
  return await supabase
    .from('orders')
    .select('*')
    .eq('store_id', storeId);
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at'>) {
  return await supabase.from('orders').insert(order);
}

export async function updateOrder(id: string, updates: Partial<Order>) {
  return await supabase.from('orders').update(updates).eq('id', id);
}

export async function getOrdersByTrackingNumber(trackingNumber: string) {
  return await supabase
    .from('orders')
    .select('*')
    .eq('tracking_number', trackingNumber);
}

// Item Operations
export async function getItems(orderId: string) {
  return await supabase
    .from('items')
    .select('*')
    .eq('order_id', orderId);
}

export async function createItem(item: Omit<Item, 'id' | 'created_at'>) {
  return await supabase.from('items').insert(item);
}

export async function updateItem(id: string, updates: Partial<Item>) {
  return await supabase.from('items').update(updates).eq('id', id);
}

// Batch Operations
export async function createOrderWithItems(
  order: Omit<Order, 'id' | 'created_at'>,
  items: Omit<Item, 'id' | 'created_at' | 'order_id'>[]
) {
  const { data: orderData, error: orderError } = await createOrder(order);
  if (orderError || !orderData) throw orderError;

  const orderId = orderData[0].id;
  const itemsWithOrderId = items.map(item => ({ ...item, order_id: orderId }));

  const { error: itemsError } = await supabase.from('items').insert(itemsWithOrderId);
  if (itemsError) throw itemsError;

  return { orderId };
}

// Subscription Helpers
export function subscribeToOrders(storeId: string, callback: (payload: any) => void) {
  return supabase
    .channel('orders')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `store_id=eq.${storeId}`
      },
      callback
    )
    .subscribe();
}

export function subscribeToItems(orderId: string, callback: (payload: any) => void) {
  return supabase
    .channel('items')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'items',
        filter: `order_id=eq.${orderId}`
      },
      callback
    )
    .subscribe();
}
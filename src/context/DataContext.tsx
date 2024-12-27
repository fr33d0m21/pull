import React, { createContext, useContext, useState, useCallback } from 'react';
import { useStore } from './StoreContext';
import { supabase } from '../lib/supabase';
import type { DataContext as DataContextType, DashboardItem, WorkingItem, CompletedOrder, DashboardStats } from '../types';
import type { Database } from '../types/supabase';

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentStore } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([]);
  const [workingItems, setWorkingItems] = useState<WorkingItem[]>([]);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalItems: 0,
    receivedItems: 0,
  });

  // Load store data
  const loadStoreData = useCallback(async () => {
    if (!currentStore) return;

    setIsLoading(true);
    try {
      // Load pullback items first
      const { data: pullbackItems, error: pullbackError } = await supabase
        .from('pullback_items')
        .select('*')
        .eq('store_id', currentStore.id)
        .order('created_at', { ascending: false });

      if (pullbackError) throw pullbackError;

      // Then load related items
      const itemIds = pullbackItems?.map(item => item.item_id) || [];
      const { data: items, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .in('id', itemIds);

      if (itemsError) throw itemsError;

      // Combine pullback items with their related items
      const workingItemsWithData = pullbackItems?.map(pullbackItem => ({
        ...pullbackItem,
        item: items?.find(item => item.id === pullbackItem.item_id),
        actual_return_qty: items?.find(item => item.id === pullbackItem.item_id)?.actual_return_qty || 0
      })) || [];

      // Filter working items (new or processing status)
      const working = workingItemsWithData.filter(
        item => item.processing_status === 'new' || item.processing_status === 'processing'
      );
      setWorkingItems(working as WorkingItem[]);

      // Load completed orders
      console.log('Loading completed orders for store:', currentStore.id);
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', currentStore.id)
        .in('processing_status', ['completed', 'cancelled'])
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
        throw ordersError;
      }
      console.log('Loaded orders:', orders?.length || 0, 'orders');
      console.log('Orders data:', orders);

      if (!orders || orders.length === 0) {
        console.log('No completed orders found');
        setCompletedOrders([]);
        return;
      }

      // Load items for completed orders
      const orderItemIds = orders.map(order => order.item_id);
      console.log('Loading items for order IDs:', orderItemIds);
      
      const { data: orderItems, error: orderItemsError } = await supabase
        .from('items')
        .select('*')
        .in('id', orderItemIds);

      if (orderItemsError) {
        console.error('Error loading order items:', orderItemsError);
        throw orderItemsError;
      }
      console.log('Loaded items:', orderItems?.length || 0, 'items');
      console.log('Items data:', orderItems);

      // Combine orders with their items
      const ordersWithItems = orders.map(order => {
        const item = orderItems?.find(item => item.id === order.item_id);
        if (!item) {
          console.warn('Could not find item for order:', order.id, 'item_id:', order.item_id);
        }
        return {
          ...order,
          item
        };
      });

      console.log('Final combined orders with items:', ordersWithItems);
      setCompletedOrders(ordersWithItems);

      // Load all items for dashboard
      const { data: allItems, error: allItemsError } = await supabase
        .from('items')
        .select('*')
        .eq('store_id', currentStore.id)
        .order('created_at', { ascending: false });

      if (allItemsError) throw allItemsError;
      setDashboardItems(allItems as DashboardItem[]);

      // Calculate stats
      const newStats: DashboardStats = {
        totalOrders: allItems?.length || 0,
        pendingOrders: allItems?.filter(i => i.status === 'new').length || 0,
        completedOrders: allItems?.filter(i => i.status === 'completed').length || 0,
        cancelledOrders: allItems?.filter(i => i.status === 'cancelled').length || 0,
        totalItems: allItems?.reduce((sum, i) => sum + i.requested_quantity, 0) || 0,
        receivedItems: allItems?.reduce((sum, i) => sum + i.actual_return_qty, 0) || 0,
      };
      setStats(newStats);

    } catch (error) {
      console.error('Error loading store data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentStore]);

  // Process order
  const processOrder = useCallback(async (orderId: string, data: Partial<WorkingItem>) => {
    if (!currentStore) return;

    const maxRetries = 2;
    let retryCount = 0;

    const tryOperation = async () => {
      try {
        console.log('Processing order:', orderId, 'with data:', data);
        
        // Get the pullback item
        const { data: pullbackItem, error: pullbackError } = await supabase
          .from('pullback_items')
          .select('*')
          .eq('id', orderId)
          .eq('store_id', currentStore.id)
          .single();

        if (pullbackError) {
          console.error('Pullback query error:', pullbackError);
          throw pullbackError;
        }
        
        if (!pullbackItem) {
          throw new Error('Pullback item not found');
        }

        console.log('Found pullback item:', pullbackItem);

        // If completing order, do all updates in parallel
        if (data.processing_status === 'completed' || data.processing_status === 'cancelled') {
          console.log('Creating completed order record...');
          const [updateResult, itemResult, orderResult] = await Promise.all([
            // Update pullback item
            supabase
              .from('pullback_items')
              .update({
                processing_status: data.processing_status,
                tracking_numbers: data.tracking_numbers || [],
                carriers: data.carriers || [],
                notes: data.notes,
                updated_at: new Date().toISOString()
              })
              .eq('id', orderId)
              .eq('store_id', currentStore.id),

            // Update item status
            supabase
              .from('items')
              .update({
                status: data.processing_status,
                actual_return_qty: data.actual_return_qty,
                updated_at: new Date().toISOString(),
              })
              .eq('id', pullbackItem.item_id),

            // Create order record
            supabase
              .from('orders')
              .insert({
                order_id: pullbackItem.order_id,
                item_id: pullbackItem.item_id,
                store_id: currentStore.id,
                spreadsheet_id: pullbackItem.spreadsheet_id,
                processing_status: data.processing_status,
                processing_date: new Date().toISOString(),
                tracking_numbers: data.tracking_numbers || [],
                carriers: data.carriers || [],
                notes: data.notes,
              })
          ]);

          console.log('Update results:', {
            pullbackUpdate: updateResult,
            itemUpdate: itemResult,
            orderCreate: orderResult
          });

          if (updateResult.error) {
            console.error('Update error:', updateResult.error);
            throw updateResult.error;
          }

          if (itemResult.error) {
            console.error('Item update error:', itemResult.error);
            throw itemResult.error;
          }

          if (orderResult.error) {
            console.error('Order creation error:', orderResult.error);
            throw orderResult.error;
          }

          console.log('Successfully completed order processing');
        } else {
          // Just update the pullback item
          console.log('Updating pullback item status...');
          const { error: updateError } = await supabase
            .from('pullback_items')
            .update({
              processing_status: data.processing_status,
              tracking_numbers: data.tracking_numbers || [],
              carriers: data.carriers || [],
              notes: data.notes,
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .eq('store_id', currentStore.id);

          if (updateError) {
            console.error('Update error:', updateError);
            throw updateError;
          }
        }

        // Immediately reload store data
        console.log('Reloading store data...');
        await loadStoreData();
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        if (retryCount < maxRetries) {
          retryCount++;
          // Shorter backoff time
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return tryOperation();
        }
        throw error;
      }
    };

    await tryOperation();
  }, [currentStore, loadStoreData]);

  // Load initial data
  React.useEffect(() => {
    if (currentStore) {
      loadStoreData();
    }
  }, [currentStore, loadStoreData]);

  const value = {
    dashboardItems,
    workingItems,
    completedOrders,
    stats,
    isLoading,
    processOrder,
    loadStoreData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export default DataContext;
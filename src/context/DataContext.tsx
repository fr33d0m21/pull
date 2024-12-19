import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { DataContext as DataContextType, RemovalOrder, DashboardStats, TrackingEntry } from '../types';
import { useStore } from './StoreContext';
import { generateUniqueId } from '../utils/uniqueKey';
import { supabase } from '../lib/supabase';

const calculateStats = (orders: RemovalOrder[]): DashboardStats => {
  return {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.orderStatus === 'Pending').length,
    completedOrders: orders.filter(o => o.orderStatus === 'Completed').length,
    cancelledOrders: orders.filter(o => o.orderStatus === 'Cancelled').length,
    totalItems: orders.reduce((sum, order) => sum + order.requestedQuantity, 0),
    receivedItems: orders.reduce((sum, order) => sum + order.actualReturnQty, 0),
  };
};

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { currentStore } = useStore();
  const [ordersByStore, setOrdersByStore] = useState<Record<string, RemovalOrder[]>>({});
  const [statsByStore, setStatsByStore] = useState<Record<string, DashboardStats>>({});
  const [currentSpreadsheet, setCurrentSpreadsheet] = useState<string | null>(null);
  const [trackingEntriesByStore, setTrackingEntriesByStore] = useState<Record<string, TrackingEntry[]>>({});
  const [currentTrackingSpreadsheet, setCurrentTrackingSpreadsheet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const currentOrders = currentStore ? ordersByStore[currentStore.id] || [] : [];
  const currentStats = currentStore ? statsByStore[currentStore.id] || calculateStats([]) : calculateStats([]);
  const currentTrackingEntries = currentStore ? trackingEntriesByStore[currentStore.id] || [] : [];

  // Fetch data from database when store changes
  useEffect(() => {
    if (!currentStore) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch tracking entries
        const { data: trackingData, error: trackingError } = await supabase
          .from('tracking_entries')
          .select('*')
          .eq('store_id', currentStore.id);

        if (trackingError) throw trackingError;

        // Transform tracking data
        const transformedTrackingEntries = trackingData.map(entry => ({
          id: entry.id,
          spreadsheetId: entry.spreadsheet_id,
          uploadDate: entry.created_at,
          storeId: entry.store_id,
          processingStatus: entry.processing_status || 'new',
          requestDate: entry.request_date,
          shipmentDate: entry.shipment_date,
          orderId: entry.order_id,
          trackingNumber: entry.tracking_number,
          removalOrderType: entry.removal_order_type,
          shippedQuantity: entry.shipped_quantity,
          carrier: entry.carrier
        }));

        // Update tracking entries state
        setTrackingEntriesByStore(prev => ({
          ...prev,
          [currentStore.id]: transformedTrackingEntries
        }));

        // Fetch removal orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('removal_orders')
          .select('*')
          .eq('store_id', currentStore.id);

        if (ordersError) throw ordersError;

        // Transform orders data
        const transformedOrders = ordersData.map(order => ({
          id: order.id,
          spreadsheetId: order.spreadsheet_id,
          uploadDate: order.created_at,
          storeId: order.store_id,
          processingStatus: order.processing_status || 'new',
          requestDate: order.request_date,
          orderId: order.order_id,
          removalOrderType: order.removal_order_type,
          requestedQuantity: order.requested_quantity,
          actualReturnQty: order.actual_return_qty || 0,
          trackingNumbers: order.tracking_numbers || [],
          carriers: order.carriers || [],
          items: order.items || []
        }));

        // Update orders state
        setOrdersByStore(prev => {
          const updatedOrders = {
            ...prev,
            [currentStore.id]: transformedOrders
          };

          // Update stats
          setStatsByStore(prevStats => ({
            ...prevStats,
            [currentStore.id]: calculateStats(transformedOrders),
          }));

          return updatedOrders;
        });

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentStore]);

  const processOrder = useCallback((orderId: string, data: Partial<RemovalOrder>) => {
    if (!currentStore) return;

    setOrdersByStore(prev => {
      const orders = prev[currentStore.id] || [];
      const updatedOrders = orders.map(order => {
        if (order.orderId === orderId) {
          // Check if all items are processed
          const allItemsProcessed = data.items?.every(item => 
            item.receivedQuantity === item.expectedQuantity
          );

          return {
            ...order,
            ...data,
            processingStatus: allItemsProcessed ? 'completed' : 'processing',
            processingDate: allItemsProcessed ? new Date().toISOString() : order.processingDate,
            id: order.id
          };
        }
        return order;
      });
      
      setStatsByStore(prevStats => ({
        ...prevStats,
        [currentStore.id]: calculateStats(updatedOrders),
      }));

      return {
        ...prev,
        [currentStore.id]: updatedOrders,
      };
    });
  }, [currentStore]);

  const getOrderByOrderId = useCallback((orderId: string): RemovalOrder | null => {
    if (!currentStore) return null;
    return ordersByStore[currentStore.id]?.find(order => order.orderId === orderId) || null;
  }, [currentStore, ordersByStore]);

  const addOrders = useCallback((newOrders: RemovalOrder[]) => {
    if (!currentStore) return;

    const spreadsheetId = generateUniqueId();
    const ordersWithMetadata = newOrders.map(order => ({
      ...order,
      spreadsheetId,
      uploadDate: new Date().toISOString(),
      storeId: currentStore.id,
      processingStatus: 'new',
      trackingNumbers: [],
      carriers: [],
      items: []
    }));

    setOrdersByStore(prev => {
      const updatedOrders = [...(prev[currentStore.id] || []), ...ordersWithMetadata];
      const newStats = calculateStats(updatedOrders);
      
      setStatsByStore(prevStats => ({
        ...prevStats,
        [currentStore.id]: newStats,
      }));

      setCurrentSpreadsheet(spreadsheetId);

      return {
        ...prev,
        [currentStore.id]: updatedOrders,
      };
    });
  }, [currentStore]);

  const clearOrders = useCallback(() => {
    if (!currentStore) return;

    setOrdersByStore(prev => ({
      ...prev,
      [currentStore.id]: [],
    }));

    setStatsByStore(prev => ({
      ...prev,
      [currentStore.id]: calculateStats([]),
    }));

    setCurrentSpreadsheet(null);
  }, [currentStore]);

  const updateOrder = useCallback((updatedOrder: RemovalOrder) => {
    if (!currentStore) return;

    setOrdersByStore(prev => {
      const orders = prev[currentStore.id] || [];
      const updatedOrders = orders.map(order => {
        if (order.id === updatedOrder.id) {
          return {
            ...order,
            ...updatedOrder,
            id: order.id
          };
        }
        return order;
      });
      
      setStatsByStore(prevStats => ({
        ...prevStats,
        [currentStore.id]: calculateStats(updatedOrders),
      }));

      return {
        ...prev,
        [currentStore.id]: updatedOrders,
      };
    });
  }, [currentStore]);

  const getSpreadsheets = useCallback(() => {
    if (!currentStore || !ordersByStore[currentStore.id]) return [];

    const spreadsheets = new Map<string, { id: string; name: string; date: string }>();
    
    ordersByStore[currentStore.id].forEach(order => {
      if (order.spreadsheetId && !spreadsheets.has(order.spreadsheetId)) {
        spreadsheets.set(order.spreadsheetId, {
          id: order.spreadsheetId,
          name: `Spreadsheet ${spreadsheets.size + 1}`,
          date: order.uploadDate,
        });
      }
    });

    return Array.from(spreadsheets.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [currentStore, ordersByStore]);

  const getCurrentSpreadsheet = useCallback(() => currentSpreadsheet, [currentSpreadsheet]);

  // Tracking related functions
  const addTrackingEntries = useCallback((newEntries: TrackingEntry[]) => {
    if (!currentStore) return;

    const spreadsheetId = generateUniqueId();
    const entriesWithMetadata = newEntries.map(entry => ({
      ...entry,
      spreadsheetId,
      uploadDate: new Date().toISOString(),
      storeId: currentStore.id,
    }));

    setTrackingEntriesByStore(prev => ({
      ...prev,
      [currentStore.id]: [...(prev[currentStore.id] || []), ...entriesWithMetadata],
    }));

    setCurrentTrackingSpreadsheet(spreadsheetId);
  }, [currentStore]);

  const clearTrackingEntries = useCallback(() => {
    if (!currentStore) return;

    setTrackingEntriesByStore(prev => ({
      ...prev,
      [currentStore.id]: [],
    }));

    setCurrentTrackingSpreadsheet(null);
  }, [currentStore]);

  const updateTrackingEntry = useCallback((updatedEntry: TrackingEntry) => {
    if (!currentStore) return;

    setTrackingEntriesByStore(prev => {
      const entries = prev[currentStore.id] || [];
      const updatedEntries = entries.map(entry => 
        entry.id === updatedEntry.id ? { ...entry, ...updatedEntry } : entry
      );

      return {
        ...prev,
        [currentStore.id]: updatedEntries,
      };
    });
  }, [currentStore]);

  const getTrackingSpreadsheets = useCallback(() => {
    if (!currentStore || !trackingEntriesByStore[currentStore.id]) return [];

    const spreadsheets = new Map<string, { id: string; name: string; date: string }>();
    
    trackingEntriesByStore[currentStore.id].forEach(entry => {
      if (entry.spreadsheetId && !spreadsheets.has(entry.spreadsheetId)) {
        spreadsheets.set(entry.spreadsheetId, {
          id: entry.spreadsheetId,
          name: `Tracking Sheet ${spreadsheets.size + 1}`,
          date: entry.uploadDate,
        });
      }
    });

    return Array.from(spreadsheets.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [currentStore, trackingEntriesByStore]);

  const getCurrentTrackingSpreadsheet = useCallback(() => currentTrackingSpreadsheet, [currentTrackingSpreadsheet]);

  return (
    <DataContext.Provider value={{
      orders: currentSpreadsheet 
        ? currentOrders.filter(order => order.spreadsheetId === currentSpreadsheet)
        : currentOrders,
      ordersByStore,
      statsByStore,
      stats: currentStats,
      addOrders,
      clearOrders,
      updateOrder,
      processOrder,
      getOrderByOrderId,
      getSpreadsheets,
      getCurrentSpreadsheet,
      setCurrentSpreadsheet,
      trackingEntries: currentTrackingSpreadsheet
        ? currentTrackingEntries.filter(entry => entry.spreadsheetId === currentTrackingSpreadsheet)
        : currentTrackingEntries,
      trackingEntriesByStore,
      addTrackingEntries,
      clearTrackingEntries,
      updateTrackingEntry,
      getTrackingSpreadsheets,
      getCurrentTrackingSpreadsheet,
      setCurrentTrackingSpreadsheet,
      isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
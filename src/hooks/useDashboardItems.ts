import { useCallback, useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';
import { DashboardItem } from '../types';

export function useDashboardItems() {
  const { currentStore } = useStore();
  const [items, setItems] = useState<DashboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (!currentStore) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      setItems(data || []);

    } catch (err) {
      console.error('Error loading dashboard items:', err);
      setError(err instanceof Error ? err.message : 'Error loading items');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentStore]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return {
    items,
    isLoading,
    error,
    refresh: loadItems,
  };
} 
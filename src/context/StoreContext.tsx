import { createContext, useContext, useState, useEffect } from 'react';
import type { Store, StoreContext as StoreContextType } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const StoreContext = createContext<StoreContextType>({
  currentStore: null,
  setCurrentStore: () => {},
  stores: [],
  addStore: async () => {},
  updateStore: async () => {},
  removeStore: async () => {},
});

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const { profile } = useAuth();

  // Fetch stores on mount and when profile changes
  useEffect(() => {
    if (profile) {
      fetchStores();
    }
  }, [profile]);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching stores:', error);
        return;
      }
      
      setStores(data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const addStore = async ({ name, code }: Pick<Store, 'name' | 'code'>) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert([{ 
          name: name.trim(), 
          code: code.trim().toUpperCase(),
          created_by: profile?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding store:', error);
        throw error;
      }

      if (data) {
        setStores(prev => [...prev, data]);
        return data;
      }
    } catch (error) {
      console.error('Error adding store:', error);
      throw error;
    }
  };

  const updateStore = async (updatedStore: Store) => {
    try {
      const { error } = await supabase
        .from('stores')
        .update({
          name: updatedStore.name.trim(),
          code: updatedStore.code.trim().toUpperCase()
        })
        .eq('id', updatedStore.id);

      if (error) {
        console.error('Error updating store:', error);
        throw error;
      }

      setStores(prev => prev.map(store => 
        store.id === updatedStore.id ? { ...store, ...updatedStore } : store
      ));

      if (currentStore?.id === updatedStore.id) {
        setCurrentStore({ ...currentStore, ...updatedStore });
      }
    } catch (error) {
      console.error('Error updating store:', error);
      throw error;
    }
  };

  const removeStore = async (storeId: string) => {
    try {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId);

      if (error) {
        console.error('Error removing store:', error);
        throw error;
      }

      setStores(prev => prev.filter(store => store.id !== storeId));
      if (currentStore?.id === storeId) {
        setCurrentStore(null);
      }
    } catch (error) {
      console.error('Error removing store:', error);
      throw error;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        currentStore,
        setCurrentStore,
        stores,
        addStore,
        updateStore,
        removeStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Store } from '../../types';
import { Building2, Plus, PencilLine, Trash2, Users, X } from 'lucide-react';

export default function StoreManagement() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStore, setEditingStore] = useState<string | null>(null);
  const [newStore, setNewStore] = useState({
    name: '',
    code: ''
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');

      if (error) throw error;
      setStores(data || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStore = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('stores')
        .insert({
          name: newStore.name,
          code: newStore.code.toUpperCase()
        });

      if (error) throw error;
      setNewStore({ name: '', code: '' });
      await fetchStores();
    } catch (error) {
      console.error('Error adding store:', error);
      alert('Failed to add store');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStore = async (storeId: string, updates: Partial<Store>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', storeId);

      if (error) throw error;
      await fetchStores();
      setEditingStore(null);
    } catch (error) {
      console.error('Error updating store:', error);
      alert('Failed to update store');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStore = async (storeId: string) => {
    if (!confirm('Are you sure you want to delete this store?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', storeId);

      if (error) throw error;
      await fetchStores();
    } catch (error) {
      console.error('Error deleting store:', error);
      alert('Failed to delete store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900">Add New Store</h2>
        <div className="mt-3 flex gap-4">
          <input
            type="text"
            value={newStore.name}
            onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Store name"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <input
            type="text"
            value={newStore.code}
            onChange={(e) => setNewStore(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
            placeholder="Store code"
            className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm uppercase"
          />
          <button
            onClick={handleAddStore}
            disabled={loading || !newStore.name || !newStore.code}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Store
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Code
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Created
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {editingStore === store.id ? (
                        <input
                          type="text"
                          value={store.name}
                          onChange={(e) => handleUpdateStore(store.id, { name: e.target.value })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      ) : (
                        store.name
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {editingStore === store.id ? (
                        <input
                          type="text"
                          value={store.code}
                          onChange={(e) => handleUpdateStore(store.id, { code: e.target.value.toUpperCase() })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm uppercase"
                        />
                      ) : (
                        store.code
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {new Date(store.created_at).toLocaleDateString()}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <div className="flex justify-end gap-2">
                        {editingStore === store.id ? (
                          <button
                            onClick={() => setEditingStore(null)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingStore(store.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <PencilLine className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStore(store.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

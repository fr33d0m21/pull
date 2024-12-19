import { useState, useEffect } from 'react';
import { Building2, Plus, Pencil, Trash2, X, Users } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import type { Store } from '../types';
import StoreUserManager from './StoreUserManager';

export default function StoreManager() {
  const { stores, addStore, updateStore, removeStore } = useStore();
  const { profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [newStore, setNewStore] = useState({ name: '', code: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [managingUsers, setManagingUsers] = useState<string | null>(null);

  // Check if it's first time visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedStoreManager');
    if (!hasVisited && stores.length === 0) {
      setIsOpen(true);
      localStorage.setItem('hasVisitedStoreManager', 'true');
    }
  }, [stores.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const storeData = editingStore || newStore;
      if (!storeData.name.trim() || !storeData.code.trim()) {
        setError('Store name and code are required');
        return;
      }

      // Validate store code format
      if (!/^[A-Z]{2,5}$/.test(storeData.code)) {
        setError('Store code must be 2-5 uppercase letters');
        return;
      }

      // Check for duplicate store code
      const isDuplicate = stores.some(store => 
        store.code === storeData.code && store.id !== editingStore?.id
      );
      if (isDuplicate) {
        setError('Store code must be unique');
        return;
      }

      if (editingStore) {
        await updateStore({ ...editingStore, ...storeData });
      } else {
        await addStore(storeData);
      }

      setNewStore({ name: '', code: '' });
      setEditingStore(null);
      if (!editingStore) {
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Error saving store:', err);
      setError('Failed to save store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (store: Store) => {
    if (!confirm(`Are you sure you want to delete ${store.name}?`)) {
      return;
    }

    setLoading(true);
    try {
      await removeStore(store.id);
    } catch (err) {
      console.error('Error deleting store:', err);
      setError('Failed to delete store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!profile?.role || (profile.role !== 'admin' && !profile.permissions?.manage_stores)) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Store
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

            {/* Modal panel */}
            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Building2 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      {editingStore ? 'Edit Store' : 'Add New Store'}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Fill in the store details below. The store code should be a unique 2-5 letter identifier for the store.
                      </p>
                    </div>

                    {error && (
                      <div className="mt-4 p-2 bg-red-50 text-red-700 text-sm rounded">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                          Store Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="name"
                            value={editingStore?.name || newStore.name}
                            onChange={(e) => {
                              if (editingStore) {
                                setEditingStore({ ...editingStore, name: e.target.value });
                              } else {
                                setNewStore({ ...newStore, name: e.target.value });
                              }
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            placeholder="Enter the full store name (e.g., Downtown Store)"
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Use a descriptive name that clearly identifies the store location
                        </p>
                      </div>

                      <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                          Store Code
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            id="code"
                            value={editingStore?.code || newStore.code}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase();
                              if (editingStore) {
                                setEditingStore({ ...editingStore, code: value });
                              } else {
                                setNewStore({ ...newStore, code: value });
                              }
                            }}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm uppercase"
                            placeholder="Enter a 2-5 letter code (e.g., DTW)"
                            maxLength={5}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Use 2-5 uppercase letters that uniquely identify this store. This code cannot be changed later.
                        </p>
                      </div>

                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={loading}
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : editingStore ? 'Save Changes' : 'Create Store'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            setEditingStore(null);
                            setNewStore({ name: '', code: '' });
                            setError('');
                          }}
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {stores.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Stores</h4>
          <ul className="space-y-2">
            {stores.map((store) => (
              <li key={store.id} className="flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="font-medium">{store.name}</span>
                  <span className="ml-2 text-gray-500">({store.code})</span>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEditingStore(store)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(store)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setManagingUsers(store.id)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Users className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {managingUsers && (
        <StoreUserManager
          storeId={managingUsers}
          onClose={() => setManagingUsers(null)}
        />
      )}
    </div>
  );
}
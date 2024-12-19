import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { Building2 } from 'lucide-react';
import StoreManager from './StoreManager';

export default function StoreSelector() {
  const { currentStore, setCurrentStore, stores } = useStore();
  const { profile, hasPermission } = useAuth();

  const accessibleStores = stores.filter(store => {
    if (profile?.role === 'admin') return true;
    if (profile?.role === 'manager') return profile.managedStores?.includes(store.id);
    return profile?.storeIds.includes(store.id);
  });

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
        <Building2 className="w-5 h-5 text-gray-500" />
        <select
          value={currentStore?.id || ''}
          onChange={(e) => {
            const store = stores.find((s) => s.id === e.target.value);
            setCurrentStore(store || null);
          }}
          className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option value="">Select Store</option>
          {accessibleStores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>
      {hasPermission('manageStores') && <StoreManager />}
    </div>
  );
}
import { Building2, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StoreManager from '../StoreManager';

export default function WelcomeScreen() {
  const { profile } = useAuth();

  return (
    <div className="mt-12 max-w-lg mx-auto text-center">
      <Building2 className="mx-auto h-16 w-16 text-gray-400" />
      <h2 className="mt-4 text-2xl font-semibold text-gray-900">Welcome to Amazon Pullback Management</h2>
      
      {profile?.role === 'admin' || profile?.role === 'manager' ? (
        <div className="mt-8">
          <p className="text-gray-600 mb-6">
            Get started by creating your first store to manage pullback orders.
          </p>
          <StoreManager />
        </div>
      ) : (
        <div className="mt-8">
          <p className="text-gray-600">
            Please contact your manager to get access to a store.
          </p>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Building2 } from 'lucide-react';
import UserManagement from './UserManagement';
import StoreManagement from './StoreManagement';
import { Navigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'stores'>('users');
  const { profile } = useAuth();

  if (!profile || profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage users and stores across the system
        </p>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            } px-3 py-2 font-medium text-sm rounded-md inline-flex items-center`}
          >
            <Users className="w-5 h-5 mr-2" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('stores')}
            className={`${
              activeTab === 'stores'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700'
            } px-3 py-2 font-medium text-sm rounded-md inline-flex items-center`}
          >
            <Building2 className="w-5 h-5 mr-2" />
            Store Management
          </button>
        </nav>
      </div>

      <div className="bg-white shadow rounded-lg">
        {activeTab === 'users' ? <UserManagement /> : <StoreManagement />}
      </div>
    </div>
  );
}

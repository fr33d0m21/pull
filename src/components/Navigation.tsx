import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import StoreSelector from './StoreSelector';
import FileUpload from './FileUpload';
import QuickSearch from './QuickSearch';
import { LayoutGrid, Table, Package, Settings } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();
  const { currentStore } = useStore();
  const { hasPermission, profile } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">
                Amazon Pullback Management System
              </h1>
              <QuickSearch />
            </div>
            <div className="mt-4 flex space-x-4">
              <Link
                to="/"
                className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                  location.pathname === '/'
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              {hasPermission('viewSpreadsheet') && (
                <Link
                  to="/spreadsheet"
                  className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                    location.pathname === '/spreadsheet'
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Table className="w-4 h-4 mr-2" />
                  Spreadsheet
                </Link>
              )}
              <Link
                to="/tracking"
                className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                  location.pathname === '/tracking'
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Package className="w-4 h-4 mr-2" />
                Working
              </Link>
              {profile?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                    location.pathname === '/admin'
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <StoreSelector />
            {currentStore && (
              <>
                {location.pathname === '/tracking' ? (
                  <FileUpload type="tracking" />
                ) : (
                  <FileUpload type="removal" />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
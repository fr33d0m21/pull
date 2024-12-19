import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { DataProvider } from './context/DataContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import SpreadsheetView from './components/SpreadsheetView';
import TrackingView from './components/TrackingView';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginForm from './components/auth/LoginForm';

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <DataProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </DataProvider>
    </StoreProvider>
  );
}

function PrivateRoute({ children, requireAdmin }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { user, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!profile) {
    return <LoadingSpinner />;
  }

  if (requireAdmin && profile.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginForm />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/spreadsheet"
            element={
              <PrivateRoute>
                <SpreadsheetView />
              </PrivateRoute>
            }
          />
          <Route
            path="/tracking"
            element={
              <PrivateRoute>
                <TrackingView />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute requireAdmin>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
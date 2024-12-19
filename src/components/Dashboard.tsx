import { useStore } from '../context/StoreContext';
import MainDashboard from './MainDashboard';
import StoreStats from './dashboard/StoreStats';
import OrdersTable from './dashboard/OrdersTable';
import WelcomeScreen from './dashboard/WelcomeScreen';

export default function Dashboard() {
  const { currentStore } = useStore();

  if (!currentStore) {
    return <WelcomeScreen />;
  }

  return (
    <div className="space-y-6 mt-6">
      <StoreStats />
      <OrdersTable />
    </div>
  );
}
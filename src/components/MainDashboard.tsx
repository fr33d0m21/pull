import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useStore } from '../context/StoreContext';
import { format, parseISO, differenceInDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Package, CheckCircle, Clock, TrendingUp, DollarSign, Truck, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import AnalyticsDetailsModal from './analytics/AnalyticsDetailsModal';
import type { RemovalOrder, TrackingEntry } from '../types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function MainDashboard() {
  const { ordersByStore, statsByStore, trackingEntriesByStore } = useData();
  const { stores } = useStore();
  const [selectedMetric, setSelectedMetric] = useState<{
    title: string;
    data: (RemovalOrder | TrackingEntry)[];
    type: 'orders' | 'tracking';
  } | null>(null);

  const calculateTotalStats = () => {
    const allOrders = Object.values(ordersByStore).flat();
    const allTracking = Object.values(trackingEntriesByStore).flat();
    const totalExpected = allOrders.reduce((sum, order) => sum + order.requestedQuantity, 0);
    const totalReceived = allOrders.reduce((sum, order) => sum + order.actualReturnQty, 0);
    const totalPending = allOrders.filter(o => o.orderStatus === 'Pending').length;
    const totalRemovalFees = allOrders.reduce((sum, order) => sum + (order.removalFee || 0), 0);
    const completionRate = totalExpected > 0 ? (totalReceived / totalExpected) * 100 : 0;
    const totalShipments = allTracking.length;
    const totalShippedQuantity = allTracking.reduce((sum, entry) => sum + entry.shippedQuantity, 0);
    const mismatchedQuantities = allOrders.filter(o => o.actualReturnQty !== o.requestedQuantity).length;

    return {
      totalExpected,
      totalReceived,
      totalPending,
      totalRemovalFees,
      completionRate: completionRate.toFixed(1),
      totalShipments,
      totalShippedQuantity,
      mismatchedQuantities
    };
  };

  const getReturnsByStore = () => {
    return stores.map(store => ({
      id: store.id,
      name: store.code,
      expected: (ordersByStore[store.id] || []).reduce(
        (sum, order) => sum + order.requestedQuantity, 0
      ),
      received: (ordersByStore[store.id] || []).reduce(
        (sum, order) => sum + order.actualReturnQty, 0
      ),
    }));
  };

  const getReturnsAging = () => {
    const allOrders = Object.values(ordersByStore).flat();
    const agingBuckets = {
      '0-7 days': 0,
      '8-14 days': 0,
      '15-30 days': 0,
      '31+ days': 0,
    };

    allOrders
      .filter(order => order.orderStatus === 'Pending')
      .forEach(order => {
        const requestDate = parseISO(order.requestDate);
        const age = differenceInDays(new Date(), requestDate);
        
        if (age <= 7) agingBuckets['0-7 days']++;
        else if (age <= 14) agingBuckets['8-14 days']++;
        else if (age <= 30) agingBuckets['15-30 days']++;
        else agingBuckets['31+ days']++;
      });

    return Object.entries(agingBuckets).map(([name, value], index) => ({
      id: `aging-${index}`,
      name,
      value
    }));
  };

  const getOrderTypeDistribution = () => {
    const allOrders = Object.values(ordersByStore).flat();
    const distribution = {
      'Manual Removal': 0,
      'Automated Removal': 0,
      'Unfulfillable': 0,
      'Other': 0,
    };

    allOrders.forEach(order => {
      if (order.orderSource === 'Seller-initiated Manual Removal') {
        distribution['Manual Removal']++;
      } else if (order.orderSource === 'Automated Stranded Removal System') {
        distribution['Automated Removal']++;
      } else if (order.orderSource.includes('Unfulfillable')) {
        distribution['Unfulfillable']++;
      } else {
        distribution['Other']++;
      }
    });

    return Object.entries(distribution)
      .map(([name, value], index) => ({
        id: `type-${index}`,
        name,
        value
      }))
      .filter(item => item.value > 0);
  };

  const stats = calculateTotalStats();
  const returnsByStore = getReturnsByStore();
  const returnsAging = getReturnsAging();
  const orderTypes = getOrderTypeDistribution();

  const statCards = [
    {
      title: 'Total Expected',
      value: stats.totalExpected.toLocaleString(),
      icon: Package,
      color: 'bg-blue-500',
      onClick: () => setSelectedMetric({
        title: 'Orders with Expected Items',
        data: Object.values(ordersByStore).flat(),
        type: 'orders'
      })
    },
    {
      title: 'Total Received',
      value: stats.totalReceived.toLocaleString(),
      icon: CheckCircle,
      color: 'bg-green-500',
      onClick: () => setSelectedMetric({
        title: 'Orders with Received Items',
        data: Object.values(ordersByStore).flat().filter(o => o.actualReturnQty > 0),
        type: 'orders'
      })
    },
    {
      title: 'Pending Returns',
      value: stats.totalPending.toLocaleString(),
      icon: Clock,
      color: 'bg-yellow-500',
      onClick: () => setSelectedMetric({
        title: 'Pending Orders',
        data: Object.values(ordersByStore).flat().filter(o => o.orderStatus === 'Pending'),
        type: 'orders'
      })
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      onClick: () => setSelectedMetric({
        title: 'Orders by Completion Status',
        data: Object.values(ordersByStore).flat(),
        type: 'orders'
      })
    },
    {
      title: 'Total Removal Fees',
      value: `$${stats.totalRemovalFees.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      onClick: () => setSelectedMetric({
        title: 'Orders with Removal Fees',
        data: Object.values(ordersByStore).flat().filter(o => o.removalFee > 0),
        type: 'orders'
      })
    },
    {
      title: 'Total Shipments',
      value: stats.totalShipments.toLocaleString(),
      icon: Truck,
      color: 'bg-indigo-500',
      onClick: () => setSelectedMetric({
        title: 'All Shipments',
        data: Object.values(trackingEntriesByStore).flat(),
        type: 'tracking'
      })
    },
    {
      title: 'Shipped Quantity',
      value: stats.totalShippedQuantity.toLocaleString(),
      icon: FileSpreadsheet,
      color: 'bg-cyan-500',
      onClick: () => setSelectedMetric({
        title: 'Shipments with Items',
        data: Object.values(trackingEntriesByStore).flat().filter(t => t.shippedQuantity > 0),
        type: 'tracking'
      })
    },
    {
      title: 'Quantity Mismatches',
      value: stats.mismatchedQuantities.toLocaleString(),
      icon: AlertTriangle,
      color: stats.mismatchedQuantities > 0 ? 'bg-red-500' : 'bg-gray-500',
      onClick: () => setSelectedMetric({
        title: 'Orders with Quantity Mismatches',
        data: Object.values(ordersByStore).flat().filter(o => o.actualReturnQty !== o.requestedQuantity),
        type: 'orders'
      })
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Overall Analytics</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div
            key={`stat-${index}`}
            onClick={card.onClick}
            className="bg-white rounded-lg shadow-sm p-6 flex items-center cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className={`${card.color} p-4 rounded-lg text-white mr-4`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
              <p className="text-xl font-semibold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Returns by Store */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Returns by Store</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={returnsByStore}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="expected" name="Expected" fill="#3B82F6" />
                <Bar dataKey="received" name="Received" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Returns Aging */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Returns Aging (Pending Orders)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={returnsAging}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {returnsAging.map((entry, index) => (
                    <Cell 
                      key={`aging-${entry.id}`}
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Order Type Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderTypes.map((entry, index) => (
                    <Cell 
                      key={`type-${entry.id}`}
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {selectedMetric && (
        <AnalyticsDetailsModal
          title={selectedMetric.title}
          data={selectedMetric.data}
          type={selectedMetric.type}
          onClose={() => setSelectedMetric(null)}
        />
      )}
    </div>
  );
}
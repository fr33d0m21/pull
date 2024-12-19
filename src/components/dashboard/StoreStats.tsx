import { Package, CheckCircle, AlertTriangle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useStore } from '../../context/StoreContext';
import { format, isValid, parseISO, isToday, isThisWeek, isThisMonth, startOfDay, endOfDay } from 'date-fns';
import { PDFDownloadButton } from '../reports/PDFReport';
import AnalyticsDetailsModal from '../analytics/AnalyticsDetailsModal';
import { useState } from 'react';
import { RemovalOrder, TrackingEntry } from '../../types';

type DateFilter = 'day' | 'week' | 'month' | 'custom';

export default function StoreStats() {
  const { stats, orders, trackingEntries } = useData();
  const { currentStore } = useStore();
  const [dateFilter, setDateFilter] = useState<DateFilter>('day');
  const [customRange, setCustomRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [selectedMetric, setSelectedMetric] = useState<{
    title: string;
    data: (RemovalOrder | TrackingEntry)[];
    type: 'orders' | 'tracking';
  } | null>(null);

  const calculateStoreMetrics = () => {
    const isInRange = (date: string) => {
      const parsedDate = parseISO(date);
      switch (dateFilter) {
        case 'day':
          return isToday(parsedDate);
        case 'week':
          return isThisWeek(parsedDate);
        case 'month':
          return isThisMonth(parsedDate);
        case 'custom':
          const start = startOfDay(parseISO(customRange.start));
          const end = endOfDay(parseISO(customRange.end));
          return parsedDate >= start && parsedDate <= end;
        default:
          return false;
      }
    };

    const filteredOrders = orders.filter(order => isInRange(order.requestDate));
    const workingQueue = filteredOrders.filter(order => 
      ['new', 'processing'].includes(order.processingStatus || 'new')
    );
    const completedOrders = filteredOrders.filter(order => 
      order.processingStatus === 'completed'
    );

    const totalExpectedSKUs = workingQueue.reduce((sum, order) => 
      sum + order.requestedQuantity, 0
    );
    const missingItems = workingQueue.reduce((sum, order) => 
      sum + (order.items?.filter(item => item.condition === 'Missing').length || 0), 0
    );

    return {
      workingQueueOrders: workingQueue.length,
      completedOrders: completedOrders.length,
      expectedSKUs: totalExpectedSKUs,
      missingItems
    };
  };

  const getLatestUpdate = () => {
    if (orders.length === 0) return 'No data';
    
    const dates = orders
      .map(o => o.lastUpdatedDate)
      .filter(Boolean)
      .map(date => {
        const parsed = parseISO(date);
        return isValid(parsed) ? parsed : null;
      })
      .filter(Boolean) as Date[];

    if (dates.length === 0) return 'No valid dates';

    const latestDate = new Date(Math.max(...dates.map(d => d.getTime())));
    return format(latestDate, 'MMM d, yyyy');
  };

  const metrics = calculateStoreMetrics();

  const cards = [
    {
      title: 'Working Queue',
      value: metrics.workingQueueOrders,
      icon: Package,
      color: 'bg-blue-500',
      onClick: () => setSelectedMetric({
        title: 'Working Queue Orders',
        data: orders.filter(o => ['new', 'processing'].includes(o.processingStatus || 'new')),
        type: 'orders'
      })
    },
    {
      title: 'Completed Orders',
      value: metrics.completedOrders,
      icon: CheckCircle,
      color: 'bg-green-500',
      onClick: () => setSelectedMetric({
        title: 'Completed Orders',
        data: orders.filter(o => o.orderStatus === 'Completed'),
        type: 'orders'
      })
    },
    {
      title: 'Expected SKUs',
      value: metrics.expectedSKUs,
      icon: Package,
      color: 'bg-purple-500',
      onClick: () => setSelectedMetric({
        title: 'Orders by Expected Items',
        data: orders.sort((a, b) => b.requestedQuantity - a.requestedQuantity),
        type: 'orders'
      })
    },
    {
      title: 'Missing Items',
      value: metrics.missingItems,
      icon: AlertTriangle,
      color: metrics.missingItems > 0 ? 'bg-red-500' : 'bg-gray-500',
      onClick: () => setSelectedMetric({
        title: 'Orders with Missing Items',
        data: orders.filter(o => o.items?.some(item => item.condition === 'Missing')),
        type: 'orders'
      })
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentStore?.name} Dashboard
          </h2>
          {currentStore && <PDFDownloadButton orders={orders} storeName={currentStore.name} />}
        </div>
        <span className="text-sm text-gray-500">
          Last updated: {getLatestUpdate()}
        </span>
      </div>
      
      <div className="flex items-center space-x-4 mb-6">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value as DateFilter)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Range</option>
        </select>
        
        {dateFilter === 'custom' && (
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
            <span>to</span>
            <input
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={card.onClick}
            className="bg-white rounded-lg shadow-sm p-6 flex items-center cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className={`${card.color} p-4 rounded-lg text-white mr-4`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
              </p>
            </div>
          </div>
        ))}
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
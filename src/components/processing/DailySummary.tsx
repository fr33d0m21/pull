import { useMemo, useState } from 'react';
import { Package, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { RemovalOrder } from '../../types';
import { isToday, parseISO, isThisWeek, isThisMonth, startOfDay, endOfDay } from 'date-fns';

interface DailySummaryProps {
  orders: RemovalOrder[];
}

type DateFilter = 'day' | 'week' | 'month' | 'custom';

export default function DailySummary({ orders }: DailySummaryProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>('day');
  const [customRange, setCustomRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const stats = useMemo(() => {
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
    
    // Group orders by tracking number
    const trackingGroups = new Map<string, {
      orders: RemovalOrder[];
      totalItems: number;
    }>();

    filteredOrders.forEach(order => {
      if (order.trackingNumber) {
        if (!trackingGroups.has(order.trackingNumber)) {
          trackingGroups.set(order.trackingNumber, { orders: [], totalItems: 0 });
        }
        const group = trackingGroups.get(order.trackingNumber)!;
        group.orders.push(order);
        group.totalItems += order.shippedQuantity || 0;
      }
    });

    // Count working queue groups (groups with any unprocessed SKUs)
    const workingQueueCount = Array.from(trackingGroups.values()).filter(({ orders }) =>
      orders.some(order => order.processingStatus !== 'completed')
    ).length;

    // Count completed groups (all SKUs in group processed)
    const completedGroupsCount = Array.from(trackingGroups.values()).filter(({ orders }) =>
      orders.every(order => order.processingStatus === 'completed')
    ).length;
    
    // Count total SKUs
    const totalExpectedSKUs = filteredOrders.reduce((sum, order) => 
      sum + (order.shippedQuantity || 0), 0);
    
    // Count missing items
    const missingItems = filteredOrders.reduce((sum, order) => 
      sum + (order.items?.filter(item => item.condition === 'Missing').length || 0), 0
    );

    return {
      workingQueueOrders: workingQueueCount,
      completedOrders: completedGroupsCount,
      expectedSKUs: totalExpectedSKUs,
      missingItems
    };
  }, [orders, dateFilter, customRange]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Working Queue</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.workingQueueOrders}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Orders</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-lg">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Expected Items</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.expectedSKUs}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="bg-red-500 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Missing</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.missingItems}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
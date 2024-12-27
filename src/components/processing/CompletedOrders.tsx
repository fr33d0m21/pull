import React, { useState, useMemo } from 'react';
import { CompletedOrder } from '../../types';

interface GroupedOrder {
  id: string;
  trackingNumber: string;
  carrier: string;
  items: CompletedOrder[];
  isExpanded: boolean;
}

interface CompletedOrdersProps {
  items: CompletedOrder[];
}

export default function CompletedOrders({ items }: CompletedOrdersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  console.log('CompletedOrders - Initial items:', items);

  // Filter orders based on search term and date
  const filteredOrders = useMemo(() => {
    console.log('CompletedOrders - Filtering orders with searchTerm:', searchTerm, 'dateFilter:', dateFilter);
    const filtered = items.filter(order => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        order.order_id.toLowerCase().includes(searchLower) ||
        order.item?.sku?.toLowerCase().includes(searchLower) ||
        order.item?.fnsku?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Date filter
      const orderDate = new Date(order.processing_date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      switch (dateFilter) {
        case 'today':
          return orderDate >= today;
        case 'week':
          return orderDate >= weekAgo;
        case 'month':
          return orderDate >= monthAgo;
        default:
          return true;
      }
    });
    console.log('CompletedOrders - Filtered orders:', filtered);
    return filtered;
  }, [items, searchTerm, dateFilter]);

  // Group orders by tracking number
  const groupedOrders = useMemo(() => {
    console.log('CompletedOrders - Grouping filtered orders:', filteredOrders);
    const groups: Record<string, GroupedOrder> = {};

    filteredOrders.forEach(order => {
      // If no tracking numbers, create a group with "No Tracking"
      if (!order.tracking_numbers?.length) {
        const noTrackingKey = 'no-tracking-' + order.id;
        if (!groups[noTrackingKey]) {
          groups[noTrackingKey] = {
            id: order.id,
            trackingNumber: 'No Tracking Number',
            carrier: order.carriers?.[0] || 'Unknown',
            items: [],
            isExpanded: expandedGroups[noTrackingKey] || false,
          };
        }
        groups[noTrackingKey].items.push(order);
        return;
      }

      // Handle orders with tracking numbers
      order.tracking_numbers.forEach((trackingNumber, index) => {
        if (!groups[trackingNumber]) {
          groups[trackingNumber] = {
            id: order.id,
            trackingNumber,
            carrier: order.carriers?.[index] || 'Unknown',
            items: [],
            isExpanded: expandedGroups[trackingNumber] || false,
          };
        }
        groups[trackingNumber].items.push(order);
      });
    });

    const result = Object.values(groups).sort((a, b) => {
      const dateA = new Date(a.items[0].processing_date);
      const dateB = new Date(b.items[0].processing_date);
      return dateB.getTime() - dateA.getTime();
    });
    console.log('CompletedOrders - Grouped orders:', result);
    return result;
  }, [filteredOrders, expandedGroups]);

  const toggleExpand = (trackingNumber: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [trackingNumber]: !prev[trackingNumber],
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // If no items are provided, show a message
  if (!items || items.length === 0) {
    console.log('CompletedOrders - No items provided');
    return (
      <div className="text-center py-8 text-gray-500">
        No completed orders found
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search by Order ID or SKU"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value as 'today' | 'week' | 'month' | 'all')}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          {filteredOrders.length} orders found
        </div>
      </div>

      {/* Orders */}
      {groupedOrders.map(group => (
        <div
          key={group.trackingNumber}
          className="border rounded-lg overflow-hidden bg-white"
        >
          {/* Header */}
          <div
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            onClick={() => toggleExpand(group.trackingNumber)}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium">{group.trackingNumber}</h3>
                <p className="text-sm text-gray-500">
                  {group.carrier} • {group.items.length} items
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-green-600">Completed</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${
                  group.isExpanded ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Expanded content */}
          {group.isExpanded && (
            <div className="border-t">
              {group.items.map(order => (
                <div
                  key={order.id}
                  className="p-4 border-b last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order #{order.order_id}</p>
                      <p className="text-sm text-gray-500">
                        SKU: {order.item?.sku} • FNSKU: {order.item?.fnsku}
                      </p>
                      <p className="text-sm text-gray-500">
                        Completed: {formatDate(order.processing_date)}
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className={`${
                        order.processing_status === 'completed'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {order.processing_status === 'completed' ? 'Completed' : 'Cancelled'}
                      </span>
                    </div>
                  </div>
                  {order.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 whitespace-pre-wrap">
                        {order.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {groupedOrders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No completed orders found
        </div>
      )}
    </div>
  );
}
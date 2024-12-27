import React, { useState, useMemo } from 'react';
import { WorkingItem } from '../../types';

interface GroupedOrder {
  id: string;
  trackingNumber: string;
  carrier: string;
  items: WorkingItem[];
  isExpanded: boolean;
  isUrgent: boolean;
  isComplete: boolean;
}

interface WorkQueueProps {
  items: WorkingItem[];
  onOrderSelect: (orderId: string) => void;
  selectedOrderId?: string;
}

export default function WorkQueue({ items, onOrderSelect, selectedOrderId }: WorkQueueProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Group orders by tracking number
  const groupedOrders = useMemo(() => {
    const groups: Record<string, GroupedOrder> = {};

    items.forEach(item => {
      const trackingNumber = item.tracking_number;
      if (!trackingNumber) return;

      if (!groups[trackingNumber]) {
        groups[trackingNumber] = {
          id: item.id,
          trackingNumber,
          carrier: item.carrier,
          items: [],
          isExpanded: expandedGroups[trackingNumber] || false,
          isUrgent: false, // TODO: Implement urgency logic
          isComplete: false,
        };
      }

      groups[trackingNumber].items.push(item);

      // Update completion status
      groups[trackingNumber].isComplete = groups[trackingNumber].items.every(
        i => i.processing_status === 'completed'
      );
    });

    // Sort by urgency and completion status
    return Object.values(groups).sort((a, b) => {
      if (a.isComplete !== b.isComplete) return a.isComplete ? 1 : -1;
      if (a.isUrgent !== b.isUrgent) return b.isUrgent ? 1 : -1;
      return 0;
    });
  }, [items, expandedGroups]);

  const toggleExpand = (trackingNumber: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [trackingNumber]: !prev[trackingNumber],
    }));
  };

  return (
    <div className="space-y-4">
      {groupedOrders.map(group => (
        <div
          key={group.trackingNumber}
          className={`border rounded-lg overflow-hidden ${
            group.isComplete ? 'bg-gray-50' : 'bg-white'
          }`}
        >
          {/* Header */}
          <div
            className={`p-4 flex items-center justify-between cursor-pointer ${
              group.isUrgent ? 'bg-red-50' : ''
            }`}
            onClick={() => toggleExpand(group.trackingNumber)}
          >
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium">
                  {group.trackingNumber}
                  {group.isUrgent && (
                    <span className="ml-2 text-sm text-red-600">URGENT</span>
                  )}
                </h3>
                <p className="text-sm text-gray-500">
                  {group.carrier} • {group.items.length} items
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {group.isComplete ? (
                <span className="text-sm text-green-600">Completed</span>
              ) : (
                <span className="text-sm text-blue-600">Processing</span>
              )}
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
              {group.items.map(item => (
                <div
                  key={item.id}
                  className={`p-4 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                    selectedOrderId === item.order_id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => onOrderSelect(item.order_id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Order #{item.order_id}</p>
                      <p className="text-sm text-gray-500">
                        SKU: {item.item?.sku} • FNSKU: {item.item?.fnsku}
                      </p>
                    </div>
                    <div className="text-sm">
                      {item.processing_status === 'completed' ? (
                        <span className="text-green-600">Completed</span>
                      ) : (
                        <span className="text-blue-600">Processing</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {groupedOrders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No orders in the queue
        </div>
      )}
    </div>
  );
}
import { useMemo, useState } from 'react';
import { Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { RemovalOrder } from '../../types';
import { format, parseISO, isToday } from 'date-fns';
import { generateUniqueId } from '../../utils/uniqueKey';

interface WorkQueueProps {
  orders: RemovalOrder[];
  onOrderSelect: (orderId: string) => void;
  selectedOrderId: string | null;
}

interface GroupedOrder {
  uniqueId: string;
  trackingNumber: string;
  carrier: string;
  requestDate: string;
  status: string;
  items: {
    sku: string;
    orderId: string;
    expectedQuantity: number;
    actualQuantity: number;
    disposition: string;
  }[];
  isUrgent: boolean;
  hasMismatch: boolean;
}

export default function WorkQueue({ orders, onOrderSelect, selectedOrderId }: WorkQueueProps) {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const groupedOrders = useMemo(() => {
    const grouped = orders.reduce((acc, order) => {
        const key = order.trackingNumber;
        if (!key || !order.shippedQuantity) return acc;
        
        // Get all orders with this tracking number to check completion status
        const relatedOrders = orders.filter(o => o.trackingNumber === key);
        const isGroupCompleted = relatedOrders.every(o => o.processingStatus === 'completed');
        
        // Skip if the entire group is completed
        if (isGroupCompleted) return acc;

        if (!acc[key]) {
          const uniqueId = generateUniqueId();
          acc[key] = {
            uniqueId,
            trackingNumber: key,
            carrier: order.carrier || '',
            requestDate: order.requestDate,
            status: 'processing',
            items: [],
            isUrgent: order.orderSource === 'Seller-initiated Manual Removal' && !order.requestedBy,
            hasMismatch: false
          };
        }

        // Add item to group
        acc[key].items.push({
          sku: order.sku,
          orderId: order.orderId,
          expectedQuantity: order.shippedQuantity,
          actualQuantity: order.actualReturnQty || 0,
          disposition: order.disposition || ''
        });

        // Check for quantity mismatches
        if (order.shippedQuantity !== (order.actualReturnQty || 0)) {
          acc[key].hasMismatch = true;
        }

        return acc;
    }, {} as Record<string, GroupedOrder>);

    return Object.values(grouped).sort((a, b) => {
      // Sort by urgency first
      if (a.isUrgent !== b.isUrgent) {
        return a.isUrgent ? -1 : 1;
      }
      // Then by date
      return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
    });
  }, [orders]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  if (groupedOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Work Queue</h2>
        <p className="text-gray-500 text-center">No orders in queue</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Work Queue</h2>
      </div>
      <div className="divide-y">
        {groupedOrders.map((group) => (
          <div 
            key={group.uniqueId}
            className={`p-4 ${group.isUrgent ? 'bg-red-50' : ''}`}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleExpand(group.uniqueId)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {group.isUrgent && (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                  {!isToday(parseISO(group.requestDate)) && (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <div>
                  <div className="font-medium">{group.trackingNumber}</div>
                  <div className="text-sm text-gray-500">
                    {group.carrier} • {format(parseISO(group.requestDate), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
              {expandedOrders.has(group.uniqueId) ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>

            {/* Expanded Content */}
            {expandedOrders.has(group.uniqueId) && (
              <div className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <div 
                    key={item.orderId}
                    className={`p-3 rounded-lg border ${
                      selectedOrderId === item.orderId ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                    } hover:border-indigo-500 cursor-pointer`}
                    onClick={() => onOrderSelect(item.orderId)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{item.sku}</div>
                        <div className="text-sm text-gray-500">Order: {item.orderId}</div>
                        <div className="text-sm text-gray-500">
                          {item.disposition || 'No disposition'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          item.expectedQuantity !== item.actualQuantity ? 'text-red-600' : ''
                        }`}>
                          {item.actualQuantity} / {item.expectedQuantity}
                        </div>
                        <div className="text-sm text-gray-500">units received</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
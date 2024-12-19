import { useMemo, useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { RemovalOrder } from '../../types';
import { format, parseISO, isToday } from 'date-fns';
import { generateUniqueId } from '../../utils/uniqueKey';

interface CompletedOrdersProps {
  orders: RemovalOrder[];
}

export default function CompletedOrders({ orders }: CompletedOrdersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState<'all' | 'today'>('today');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const completedOrders = useMemo(() => {
    return orders
      .filter(order => order.processingStatus === 'completed')
      .filter(order => {
        const matchesSearch = !searchTerm || 
          order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.sku.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDate = filterDate === 'all' || 
          (filterDate === 'today' && isToday(parseISO(order.processingDate || '')));

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => 
        new Date(b.processingDate || '').getTime() - 
        new Date(a.processingDate || '').getTime()
      );
  }, [orders, searchTerm, filterDate]);

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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-medium text-gray-900">Completed Orders</h3>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value as 'all' | 'today')}
                className="border rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="today">Today</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {completedOrders.map((order) => {
          // Generate a unique key using order properties
          const orderKey = `${order.id || ''}-${order.orderId}-${order.sku}`;
          
          return (
            <div key={orderKey} className="divide-y divide-gray-100">
              <div 
                className="p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => toggleExpand(order.orderId)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{order.orderId}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Processed: {formatDate(order.processingDate)}
                    </p>
                  </div>
                  <div className="ml-4">
                    {expandedOrders.has(order.orderId) ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {expandedOrders.has(order.orderId) && (
                <div className="bg-gray-50 px-4 py-3">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">SKU</p>
                        <p className="mt-1">{order.sku}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Quantity</p>
                        <p className="mt-1">{order.actualReturnQty} / {order.requestedQuantity}</p>
                      </div>
                    </div>

                    {order.trackingNumbers && order.trackingNumbers.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Shipments</p>
                        <div className="space-y-2">
                          {order.trackingNumbers.map((tracking, index) => (
                            <div 
                              key={`${orderKey}-tracking-${index}`}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <span className="font-medium">{order.carriers?.[index]}:</span>
                              <span>{tracking}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {order.notes && order.notes.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                        <div className="space-y-1">
                          {order.notes.map((note, index) => (
                            <p 
                              key={`${orderKey}-note-${index}`}
                              className="text-sm text-gray-600"
                            >
                              {note}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {completedOrders.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No completed orders found
          </div>
        )}
      </div>
    </div>
  );
}
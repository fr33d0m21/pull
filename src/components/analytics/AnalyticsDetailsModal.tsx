import React from 'react';
import { X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { RemovalOrder, TrackingEntry } from '../../types';
import { useNavigate } from 'react-router-dom';

interface AnalyticsDetailsModalProps {
  title: string;
  data: (RemovalOrder | TrackingEntry)[];
  type: 'orders' | 'tracking';
  onClose: () => void;
}

export default function AnalyticsDetailsModal({ 
  title, 
  data, 
  type,
  onClose 
}: AnalyticsDetailsModalProps) {
  const navigate = useNavigate();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const handleRowClick = (item: RemovalOrder | TrackingEntry) => {
    onClose();
    if (type === 'orders') {
      navigate('/spreadsheet');
    } else {
      navigate('/tracking');
    }
    // Add small delay to ensure navigation is complete
    setTimeout(() => {
      const element = document.getElementById(`${type}-${item.orderId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-row');
        setTimeout(() => element.classList.remove('highlight-row'), 2000);
      }
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {type === 'orders' ? (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                      </>
                    ) : (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ship Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Carrier</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item) => (
                    <tr 
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      {type === 'orders' ? (
                        <>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {formatDate((item as RemovalOrder).requestDate)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.orderId}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.sku}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {(item as RemovalOrder).orderStatus}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {(item as RemovalOrder).requestedQuantity}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {(item as RemovalOrder).actualReturnQty}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {formatDate((item as TrackingEntry).shipmentDate)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.orderId}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {item.sku}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {(item as TrackingEntry).shippedQuantity}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {(item as TrackingEntry).carrier}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {(item as TrackingEntry).trackingNumber}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useStore } from '../context/StoreContext';
import { Loader2 } from 'lucide-react';
import EditableCell from './EditableCell';
import type { WorkingItem } from '../types';

export default function SpreadsheetView() {
  const { currentStore } = useStore();
  const { workingItems, processOrder, isLoading } = useData();
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof WorkingItem } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCellEdit = async (id: string, field: keyof WorkingItem, value: string) => {
    const item = workingItems?.find(e => e.id === id);
    if (!item) return;

    try {
      setIsUpdating(true);
      const updatedValue = field === 'actual_return_qty' ? parseInt(value, 10) : value;
      await processOrder(id, {
        ...item,
        [field]: updatedValue
      });
    } catch (error) {
      console.error('Error updating item:', error);
    } finally {
      setIsUpdating(false);
      setEditingCell(null);
    }
  };

  if (!currentStore) {
    return (
      <div className="p-4 text-center text-gray-500">
        Please select a store to view spreadsheet data
      </div>
    );
  }

  if (isLoading || isUpdating) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">
          {isLoading ? 'Loading spreadsheet data...' : 'Updating...'}
        </span>
      </div>
    );
  }

  if (!workingItems || workingItems.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No data found. Upload a file to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SKU
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              FNSKU
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tracking Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Carrier
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Request Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Shipment Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actual Return Qty
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {workingItems.map((item) => (
            <tr key={item.id} id={`order-${item.order_id}`}>
              <td className="px-6 py-4 whitespace-nowrap">
                <EditableCell
                  value={item.order_id}
                  isEditing={editingCell?.id === item.id && editingCell?.field === 'order_id'}
                  onEdit={(value) => handleCellEdit(item.id, 'order_id', value)}
                  onStartEdit={() => setEditingCell({ id: item.id, field: 'order_id' })}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">{item.item?.sku || '—'}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">{item.item?.fnsku || '—'}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <EditableCell
                  value={item.tracking_number}
                  isEditing={editingCell?.id === item.id && editingCell?.field === 'tracking_number'}
                  onEdit={(value) => handleCellEdit(item.id, 'tracking_number', value)}
                  onStartEdit={() => setEditingCell({ id: item.id, field: 'tracking_number' })}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <EditableCell
                  value={item.carrier}
                  isEditing={editingCell?.id === item.id && editingCell?.field === 'carrier'}
                  onEdit={(value) => handleCellEdit(item.id, 'carrier', value)}
                  onStartEdit={() => setEditingCell({ id: item.id, field: 'carrier' })}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <EditableCell
                  value={new Date(item.request_date).toLocaleDateString()}
                  isEditing={editingCell?.id === item.id && editingCell?.field === 'request_date'}
                  onEdit={(value) => handleCellEdit(item.id, 'request_date', value)}
                  onStartEdit={() => setEditingCell({ id: item.id, field: 'request_date' })}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <EditableCell
                  value={new Date(item.shipment_date).toLocaleDateString()}
                  isEditing={editingCell?.id === item.id && editingCell?.field === 'shipment_date'}
                  onEdit={(value) => handleCellEdit(item.id, 'shipment_date', value)}
                  onStartEdit={() => setEditingCell({ id: item.id, field: 'shipment_date' })}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <EditableCell
                  value={item.actual_return_qty?.toString() || '0'}
                  isEditing={editingCell?.id === item.id && editingCell?.field === 'actual_return_qty'}
                  onEdit={(value) => handleCellEdit(item.id, 'actual_return_qty', value)}
                  onStartEdit={() => setEditingCell({ id: item.id, field: 'actual_return_qty' })}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${item.processing_status === 'completed' ? 'bg-green-100 text-green-800' : 
                    item.processing_status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {item.processing_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
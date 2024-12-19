import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useStore } from '../context/StoreContext';
import { Loader2 } from 'lucide-react';
import EditableCell from './EditableCell';
import type { TrackingEntry } from '../types';

export default function SpreadsheetView() {
  const { currentStore } = useStore();
  const { trackingEntries, updateTrackingEntry, isLoading } = useData();
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof TrackingEntry } | null>(null);

  const handleCellEdit = (id: string, field: keyof TrackingEntry, value: any) => {
    const entry = trackingEntries.find(e => e.id === id);
    if (!entry) return;

    updateTrackingEntry({
      ...entry,
      [field]: value
    });
    setEditingCell(null);
  };

  if (!currentStore) {
    return (
      <div className="p-4 text-center text-gray-500">
        Please select a store to view spreadsheet data
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading spreadsheet data...</span>
      </div>
    );
  }

  if (!trackingEntries.length) {
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
              Shipped Quantity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {trackingEntries.map((entry) => (
            <tr key={entry.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <EditableCell
                  value={entry.orderId}
                  isEditing={editingCell?.id === entry.id && editingCell?.field === 'orderId'}
                  onEdit={(value) => handleCellEdit(entry.id, 'orderId', value)}
                  onStartEdit={() => setEditingCell({ id: entry.id, field: 'orderId' })}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <EditableCell
                  value={entry.trackingNumber}
                  isEditing={editingCell?.id === entry.id && editingCell?.field === 'trackingNumber'}
                  onEdit={(value) => handleCellEdit(entry.id, 'trackingNumber', value)}
                  onStartEdit={() => setEditingCell({ id: entry.id, field: 'trackingNumber' })}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <EditableCell
                  value={entry.carrier}
                  isEditing={editingCell?.id === entry.id && editingCell?.field === 'carrier'}
                  onEdit={(value) => handleCellEdit(entry.id, 'carrier', value)}
                  onStartEdit={() => setEditingCell({ id: entry.id, field: 'carrier' })}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <EditableCell
                  value={new Date(entry.requestDate).toLocaleDateString()}
                  isEditing={editingCell?.id === entry.id && editingCell?.field === 'requestDate'}
                  onEdit={(value) => handleCellEdit(entry.id, 'requestDate', value)}
                  onStartEdit={() => setEditingCell({ id: entry.id, field: 'requestDate' })}
                  type="date"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <EditableCell
                  value={entry.shipmentDate ? new Date(entry.shipmentDate).toLocaleDateString() : ''}
                  isEditing={editingCell?.id === entry.id && editingCell?.field === 'shipmentDate'}
                  onEdit={(value) => handleCellEdit(entry.id, 'shipmentDate', value)}
                  onStartEdit={() => setEditingCell({ id: entry.id, field: 'shipmentDate' })}
                  type="date"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <EditableCell
                  value={entry.shippedQuantity.toString()}
                  isEditing={editingCell?.id === entry.id && editingCell?.field === 'shippedQuantity'}
                  onEdit={(value) => handleCellEdit(entry.id, 'shippedQuantity', parseInt(value, 10))}
                  onStartEdit={() => setEditingCell({ id: entry.id, field: 'shippedQuantity' })}
                  type="number"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${entry.processingStatus === 'completed' ? 'bg-green-100 text-green-800' : 
                    entry.processingStatus === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {entry.processingStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
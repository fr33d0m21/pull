import { useState } from 'react';
import { Plus, X, AlertTriangle } from 'lucide-react';
import { ItemDiscrepancy } from '../../types';
import { generateUniqueId } from '../../utils/uniqueKey';

interface ItemDiscrepancyFormProps {
  discrepancies: ItemDiscrepancy[];
  onAddDiscrepancy: (discrepancy: ItemDiscrepancy) => void;
  onRemoveDiscrepancy: (id: string) => void;
}

export default function ItemDiscrepancyForm({
  discrepancies,
  onAddDiscrepancy,
  onRemoveDiscrepancy
}: ItemDiscrepancyFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [newDiscrepancy, setNewDiscrepancy] = useState<Partial<ItemDiscrepancy>>({});

  const handleSubmit = () => {
    if (!newDiscrepancy.type || !newDiscrepancy.description || !newDiscrepancy.quantity) return;

    onAddDiscrepancy({
      id: generateUniqueId(),
      type: newDiscrepancy.type as ItemDiscrepancy['type'],
      description: newDiscrepancy.description,
      quantity: newDiscrepancy.quantity,
      images: newDiscrepancy.images
    });

    setNewDiscrepancy({});
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">Discrepancies</label>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Discrepancy
        </button>
      </div>

      {showForm && (
        <div className="mt-2 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3">
            <select
              value={newDiscrepancy.type || ''}
              onChange={(e) => setNewDiscrepancy({ ...newDiscrepancy, type: e.target.value as ItemDiscrepancy['type'] })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Select type...</option>
              <option value="damage">Damage</option>
              <option value="mislabel">Mislabel</option>
              <option value="wrong-item">Wrong Item</option>
              <option value="other">Other</option>
            </select>

            <input
              type="text"
              placeholder="Description"
              value={newDiscrepancy.description || ''}
              onChange={(e) => setNewDiscrepancy({ ...newDiscrepancy, description: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />

            <input
              type="number"
              placeholder="Quantity affected"
              value={newDiscrepancy.quantity || ''}
              onChange={(e) => setNewDiscrepancy({ ...newDiscrepancy, quantity: parseInt(e.target.value) || 0 })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-2 border border-gray-300 text-sm rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-3 py-2 bg-indigo-600 text-sm text-white rounded-md hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-2 space-y-2">
        {discrepancies.map((discrepancy) => (
          <div key={discrepancy.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <div>
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-sm font-medium capitalize">{discrepancy.type}</span>
                <span className="mx-2 text-gray-500">·</span>
                <span className="text-sm text-gray-600">{discrepancy.quantity} units</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{discrepancy.description}</p>
            </div>
            <button
              onClick={() => onRemoveDiscrepancy(discrepancy.id)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
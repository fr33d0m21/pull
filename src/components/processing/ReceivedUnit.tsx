import { OrderItem } from '../../types';
import { Package, X } from 'lucide-react';

interface ReceivedUnitProps {
  unit: OrderItem;
  onChange: (unit: OrderItem) => void;
  onRemove: () => void;
}

export default function ReceivedUnit({ unit, onChange, onRemove }: ReceivedUnitProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Package className="w-5 h-5 text-gray-400 mr-2" />
          <span className="text-sm font-medium">{unit.sku}</span>
        </div>
        <button
          onClick={onRemove}
          className="p-1 rounded-full hover:bg-gray-100"
          title="Remove Unit"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
        <div className="flex space-x-2">
          <button 
            type="button" 
            onClick={() => onChange({ 
              ...unit, 
              condition: 'Sellable', 
              receivedQuantity: 1
            })}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              unit.condition === 'Sellable'
                ? 'bg-green-100 text-green-800 ring-2 ring-green-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sellable
          </button>
          <button
            type="button"
            onClick={() => onChange({ 
              ...unit, 
              condition: 'Unsellable', 
              receivedQuantity: 1
            })}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              unit.condition === 'Unsellable'
                ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Unsellable
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...unit, condition: 'Missing', receivedQuantity: 0 })}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              unit.condition === 'Missing'
                ? 'bg-red-100 text-red-800 ring-2 ring-red-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Missing
          </button>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={unit.notes || ''}
          onChange={(e) => onChange({ ...unit, notes: e.target.value })}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Any additional notes about this unit..."
        />
      </div>
    </div>
  );
}
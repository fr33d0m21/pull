import React, { useState, useCallback, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { WorkingItem } from '../../types';

interface ProcessingFormProps {
  item: WorkingItem;
  onComplete: () => void;
}

interface ProcessedItem {
  quantity: number;
  condition: 'Sellable' | 'Unsellable' | 'Missing';
  notes: string;
}

export default function ProcessingForm({ item, onComplete }: ProcessingFormProps) {
  const { processOrder } = useData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedItems, setProcessedItems] = useState<ProcessedItem[]>([]);

  // Initialize processed items
  useEffect(() => {
    if (item?.item) {
      setProcessedItems([
        {
          quantity: 0,
          condition: 'Sellable',
          notes: '',
        },
      ]);
    }
  }, [item]);

  const handleQuantityChange = useCallback((index: number, value: number) => {
    setProcessedItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], quantity: value };
      return next;
    });
  }, []);

  const handleConditionChange = useCallback((index: number, value: 'Sellable' | 'Unsellable' | 'Missing') => {
    setProcessedItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], condition: value };
      return next;
    });
  }, []);

  const handleNotesChange = useCallback((index: number, value: string) => {
    setProcessedItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], notes: value };
      return next;
    });
  }, []);

  const handleAddItem = useCallback(() => {
    setProcessedItems(prev => [
      ...prev,
      {
        quantity: 0,
        condition: 'Sellable',
        notes: '',
      },
    ]);
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setProcessedItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleComplete = useCallback(async () => {
    if (!item) return;

    setIsProcessing(true);
    try {
      // Calculate total quantity
      const totalQuantity = processedItems.reduce((sum, item) => sum + item.quantity, 0);

      // Update working item
      await processOrder(item.id, {
        processing_status: 'completed',
        actual_return_qty: totalQuantity,
        notes: processedItems.map(item => 
          `${item.quantity} ${item.condition}${item.notes ? `: ${item.notes}` : ''}`
        ).join('\n'),
      });

      onComplete();
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Error completing order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [item, processedItems, processOrder, onComplete]);

  if (!item?.item) {
    return <div>Order not found</div>;
  }

  const totalProcessed = processedItems.reduce((sum, item) => sum + item.quantity, 0);
  const expectedQuantity = item.item.requested_quantity;
  const isComplete = totalProcessed === expectedQuantity;

  return (
    <div className="space-y-6">
      {/* Order details */}
      <div>
        <h3 className="text-lg font-medium">Order Details</h3>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-medium">{item.order_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">SKU</p>
            <p className="font-medium">{item.item.sku}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">FNSKU</p>
            <p className="font-medium">{item.item.fnsku}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expected Quantity</p>
            <p className="font-medium">{expectedQuantity}</p>
          </div>
        </div>
      </div>

      {/* Processed items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Processed Items</h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="text-blue-600 hover:text-blue-800"
          >
            + Add Item
          </button>
        </div>

        <div className="space-y-4">
          {processedItems.map((processedItem, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={processedItem.quantity}
                    onChange={e => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Condition
                  </label>
                  <select
                    value={processedItem.condition}
                    onChange={e => handleConditionChange(index, e.target.value as 'Sellable' | 'Unsellable' | 'Missing')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="Sellable">Sellable</option>
                    <option value="Unsellable">Unsellable</option>
                    <option value="Missing">Missing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={processedItem.notes}
                    onChange={e => handleNotesChange(index, e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              {processedItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span>
            Total Processed: {totalProcessed} / {expectedQuantity}
          </span>
          {!isComplete && (
            <span className="text-yellow-600">
              {expectedQuantity - totalProcessed} remaining
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          disabled={isProcessing || !isComplete}
          onClick={handleComplete}
          className={`px-4 py-2 rounded-md text-white ${
            isProcessing || !isComplete
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isProcessing ? 'Processing...' : 'Complete Order'}
        </button>
      </div>
    </div>
  );
}
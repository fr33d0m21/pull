import { useState } from 'react';
import { RemovalOrder, OrderItem } from '../../types';
import { useData } from '../../context/DataContext';
import { generateUniqueId } from '../../utils/uniqueKey';
import { Plus } from 'lucide-react';
import ReceivedUnit from './ReceivedUnit';

interface ProcessingFormProps {
  order: RemovalOrder;
  onProcessingComplete: () => void;
}

export default function ProcessingForm({ order, onProcessingComplete }: ProcessingFormProps) {
  const { processOrder } = useData();
  const [items, setItems] = useState<OrderItem[]>([]);
  
  // Calculate quantities
  const expectedQuantity = order.shippedQuantity || 0;
  const totalReceived = items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);
  const remaining = expectedQuantity - items.length;

  // Initialize with shipped quantity from order
  function createInitialItem(): OrderItem {
    return {
      id: generateUniqueId(),
      sku: order.sku || '',
      fnsku: order.fnsku || '',
      expectedQuantity: 1, // Each item represents 1 unit
      receivedQuantity: 1,
      condition: '',
      notes: ''
    };
  }

  const handleConditionChange = (index: number, condition: OrderItem['condition']) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      condition
    };
    setItems(updatedItems);

    processOrder(order.orderId, {
      ...order,
      items: updatedItems,
      actualReturnQty: updatedItems.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0)
    });
  };

  const handleItemChange = (index: number, updatedItem: OrderItem) => {
    const updatedItems = [...items];
    updatedItems[index] = updatedItem;
    
    // Update receivedQuantity based on condition
    updatedItems[index].receivedQuantity = updatedItem.condition === 'Missing' ? 0 : 1;
    
    setItems(updatedItems);

    processOrder(order.orderId, {
      ...order,
      items: updatedItems,
      actualReturnQty: updatedItems.filter(item => item.condition !== 'Missing').length
    });
  };

  const handleAddItem = () => {
    const remaining = expectedQuantity - items.length;
    
    if (remaining <= 0) {
      alert('All expected units have been accounted for.');
      return;
    }

    const newItem = createInitialItem();
    setItems([...items, newItem]);

    processOrder(order.orderId, {
      ...order,
      items: [...items, newItem],
      actualReturnQty: items.length + 1,
      processingStatus: 'processing'
    });
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    const actualReceived = updatedItems.filter(item => item.condition !== 'Missing').length;

    processOrder(order.orderId, {
      ...order,
      items: updatedItems,
      actualReturnQty: updatedItems.length
    });
  };

  const handleComplete = () => {
    if (!items.every(item => item.condition)) {
      alert('Please ensure all items have a condition set.');
      return;
    }
    
    if (items.length !== expectedQuantity) {
      alert(`Please process all ${expectedQuantity} expected units. Currently processed: ${totalReceived}`);
      return;
    }

    // Mark this SKU as completed
    processOrder(order.orderId, {
      ...order,
      items,
      actualReturnQty: items.length,
      processingStatus: 'completed',
      processingDate: new Date().toISOString()
    });

    onProcessingComplete();
  };


  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Process Items</h3>
        <p className="mt-1 text-sm text-gray-500">
          Expected Units: {expectedQuantity} | Processed: {totalReceived} | Remaining: {remaining}
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Items */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-900">Received Units</h4>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={remaining <= 0}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Unit
            </button>
          </div>

          {items.map((item, index) => (
            <ReceivedUnit
              key={item.id}
              unit={item}
              onRemove={() => handleRemoveItem(index)}
              onChange={(updatedItem) => handleItemChange(index, updatedItem)}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 border-t pt-4">
          <button
            type="button"
            onClick={() => handleComplete()}
            disabled={items.length === 0 || !items.every(item => item.condition) || items.length !== expectedQuantity}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Complete Processing
          </button>
        </div>
      </div>
    </div>
  );
}
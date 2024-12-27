import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useStore } from '../context/StoreContext';
import { Loader2 } from 'lucide-react';
import DailySummary from './processing/DailySummary';
import OrderScanner from './processing/OrderScanner';
import OrderDetails from './processing/OrderDetails';
import ProcessingForm from './processing/ProcessingForm';
import WorkQueue from './processing/WorkQueue';
import CompletedOrders from './processing/CompletedOrders';
import { WorkingItem } from '../types';

export default function TrackingView() {
  const { currentStore } = useStore();
  const { workingItems, completedOrders, isLoading } = useData();
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();

  console.log('TrackingView - workingItems:', workingItems);
  console.log('TrackingView - completedOrders:', completedOrders);

  const selectedItem = selectedOrderId 
    ? workingItems.find(item => item.order_id === selectedOrderId)
    : null;

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleOrderComplete = () => {
    setSelectedOrderId(undefined);
  };

  if (!currentStore) {
    return (
      <div className="p-4 text-center text-gray-500">
        Please select a store to view orders
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="ml-2 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  if (!workingItems || workingItems.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No orders found. Upload a removal order file to get started.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DailySummary items={workingItems} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <OrderScanner onOrderSelect={handleOrderSelect} />
          
          {selectedItem && (
            <>
              <OrderDetails item={selectedItem} />
              <ProcessingForm 
                item={selectedItem}
                onComplete={handleOrderComplete}
              />
            </>
          )}
          
          <WorkQueue 
            items={workingItems}
            onOrderSelect={handleOrderSelect}
            selectedOrderId={selectedOrderId}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Completed Orders</h2>
          <CompletedOrders items={completedOrders} />
        </div>
      </div>
    </div>
  );
}
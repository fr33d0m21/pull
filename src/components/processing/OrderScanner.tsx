import { useState } from 'react';
import { Search } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface OrderScannerProps {
  onOrderSelect: (orderId: string) => void;
}

export default function OrderScanner({ onOrderSelect }: OrderScannerProps) {
  const [orderInput, setOrderInput] = useState('');
  const { workingItems } = useData();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const item = workingItems.find(item => item.order_id === orderInput.trim());
    if (item) {
      onOrderSelect(item.order_id);
      setOrderInput('');
    } else {
      alert('Order not found. Please check the order number and try again.');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value)}
            placeholder="Scan or enter order number..."
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Process
        </button>
      </form>
    </div>
  );
}
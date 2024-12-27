import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { WorkingItem } from '../types';

export default function QuickSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { workingItems } = useData();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter orders based on order ID, SKU, or FNSKU
  const filteredOrders = workingItems.filter(item => {
    if (!searchTerm) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const orderId = (item.order_id || '').toLowerCase();
    const sku = (item.item?.sku || '').toLowerCase();
    const fnsku = (item.item?.fnsku || '').toLowerCase();
    
    return orderId.includes(searchLower) || 
           sku.includes(searchLower) || 
           fnsku.includes(searchLower);
  }).slice(0, 5); // Limit to 5 results

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleSelect = (orderId: string) => {
    setIsOpen(false);
    setSearchTerm('');
    navigate('/spreadsheet');
    // Add a small delay to ensure the spreadsheet view is mounted
    setTimeout(() => {
      const element = document.getElementById(`order-${orderId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-row');
        setTimeout(() => element.classList.remove('highlight-row'), 2000);
      }
    }, 100);
  };

  return (
    <div ref={searchRef} className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none"
      >
        <Search className="w-4 h-4" />
        <span>Quick search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
            <div className="inline-block w-full max-w-2xl mt-16 text-left align-middle transition-all transform">
              <div className="relative bg-white rounded-xl shadow-2xl">
                <div className="flex items-center p-4 border-b">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search order IDs, SKUs, or FNSKUs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm focus:outline-none"
                  />
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {searchTerm && (
                  <div className="p-2 max-h-96 overflow-y-auto">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelect(item.order_id)}
                          className="w-full p-4 text-left hover:bg-gray-50 rounded-lg focus:outline-none focus:bg-gray-50"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.order_id}
                              </p>
                              <p className="text-sm text-gray-500">
                                SKU: {item.item?.sku} | FNSKU: {item.item?.fnsku}
                              </p>
                            </div>
                            <span className="text-sm text-gray-500">
                              {item.processing_status}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-gray-500 text-center">
                        No results found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
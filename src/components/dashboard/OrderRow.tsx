import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';
import type { RemovalOrder } from '../../types';
import Notes from '../Notes';

interface OrderRowProps {
  order: RemovalOrder;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (order: RemovalOrder) => void;
}

export default function OrderRow({ 
  order, 
  isEditing, 
  onEdit, 
  onCancel,
  onSave 
}: OrderRowProps) {
  const [requestedBy, setRequestedBy] = useState(order.requestedBy || '');
  const [actualQty, setActualQty] = useState(order.actualReturnQty);
  const [showShipments, setShowShipments] = useState(false);

  const isManualRemoval = order.orderSource === 'Seller-initiated Manual Removal';
  const isRequestedByMissing = isManualRemoval && !requestedBy;
  const isQuantityMismatched = actualQty !== order.requestedQuantity;

  useEffect(() => {
    setRequestedBy(order.requestedBy || '');
    setActualQty(order.actualReturnQty);
  }, [order]);

  const handleRequestedByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setRequestedBy(newValue);
    onSave({
      ...order,
      requestedBy: newValue,
      id: order.id
    });
  };

  const handleQuantityChange = (newQty: number) => {
    const validQty = Math.max(0, newQty);
    setActualQty(validQty);
    onSave({
      ...order,
      actualReturnQty: validQty,
      checkInDate: validQty > 0 ? new Date().toISOString() : undefined,
      id: order.id
    });
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <tr className={`${isRequestedByMissing ? 'bg-red-50' : ''} hover:bg-gray-50`}>
        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
          {formatDate(order.requestDate)}
        </td>
        <td className="px-4 py-2 whitespace-nowrap text-sm">
          {isManualRemoval ? (
            <select
              value={requestedBy}
              onChange={handleRequestedByChange}
              className={`border rounded p-1 ${
                !requestedBy ? 'border-red-300 bg-red-50' : ''
              }`}
            >
              <option value="">Select...</option>
              <option value="Mike">Mike</option>
              <option value="Nick">Nick</option>
            </select>
          ) : (
            <span className="text-gray-900">AMAZON AUTOMATED</span>
          )}
        </td>
        <td className="hidden sm:table-cell px-4 py-2 whitespace-nowrap text-sm text-gray-500">
          {order.orderType}
        </td>
        <td className="hidden sm:table-cell px-4 py-2 whitespace-nowrap text-sm text-gray-500">
          {order.disposition}
        </td>
        <td className="hidden lg:table-cell px-4 py-2 whitespace-nowrap text-sm text-gray-500">
          {order.newAsin || '-'}
        </td>
        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
          {order.sku}
        </td>
        <td className="hidden sm:table-cell px-4 py-2 whitespace-nowrap text-sm text-gray-500">
          {order.asin || order.fnsku}
        </td>
        <td className="hidden md:table-cell px-4 py-2 whitespace-nowrap text-sm text-gray-500">
          {order.removalIdName || order.orderId}
        </td>
        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
          {order.requestedQuantity}
        </td>
        <td className="px-4 py-2 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleQuantityChange(actualQty - 1)}
              className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Minus className="w-4 h-4 text-gray-500" />
            </button>
            
            <input
              type="number"
              min="0"
              className={`w-16 p-1.5 border rounded text-sm text-center ${
                actualQty !== order.requestedQuantity 
                  ? 'border-red-300 bg-red-50' 
                  : 'border-green-300 bg-green-50'
              }`}
              value={actualQty}
              onChange={(e) => {
                const newQty = parseInt(e.target.value) || 0;
                handleQuantityChange(newQty);
              }}
            />
            
            <button
              onClick={() => handleQuantityChange(actualQty + 1)}
              className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <Plus className="w-4 h-4 text-gray-500" />
            </button>

            {actualQty !== order.requestedQuantity && (
              <button
                onClick={() => handleQuantityChange(order.requestedQuantity)}
                className="text-xs text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
              >
                Match Expected
              </button>
            )}
          </div>
        </td>
        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
          {formatDate(order.checkInDate)}
        </td>
        <td className="px-4 py-2 whitespace-nowrap text-sm">
          <Notes order={order} onSave={onSave} />
        </td>
        <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
          <button
            onClick={() => setShowShipments(!showShipments)}
            className="text-gray-400 hover:text-gray-500"
          >
            {showShipments ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </td>
      </tr>
      {showShipments && (
        <tr>
          <td colSpan={13} className="px-4 py-2 bg-gray-50">
            <div className="text-sm text-gray-500">
              <h4 className="font-medium mb-2">Shipment Details</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {order.shipments.map((qty, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span>Shipment {index + 1}:</span>
                    <span className="font-medium">{qty}</span>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
import React from 'react';
import { WorkingItem } from '../../types';

interface OrderDetailsProps {
  item: WorkingItem;
}

export default function OrderDetails({ item }: OrderDetailsProps) {
  if (!item?.item) {
    return <div>Order not found</div>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Order Info */}
      <div>
        <h3 className="text-lg font-medium">Order Information</h3>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-medium">{item.order_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Request Date</p>
            <p className="font-medium">{formatDate(item.request_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Shipment Date</p>
            <p className="font-medium">{formatDate(item.shipment_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium capitalize">{item.processing_status}</p>
          </div>
        </div>
      </div>

      {/* Item Info */}
      <div>
        <h3 className="text-lg font-medium">Item Information</h3>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">SKU</p>
            <p className="font-medium">{item.item.sku}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">FNSKU</p>
            <p className="font-medium">{item.item.fnsku}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Disposition</p>
            <p className="font-medium">{item.item.disposition}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Removal Type</p>
            <p className="font-medium">{item.removal_order_type}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Requested Quantity</p>
            <p className="font-medium">{item.item.requested_quantity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Actual Return Quantity</p>
            <p className="font-medium">{item.actual_return_qty}</p>
          </div>
        </div>
      </div>

      {/* Shipping Info */}
      <div>
        <h3 className="text-lg font-medium">Shipping Information</h3>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Carrier</p>
            <p className="font-medium">{item.carrier}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tracking Number</p>
            <p className="font-medium">{item.tracking_number}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {item.notes && (
        <div>
          <h3 className="text-lg font-medium">Notes</h3>
          <div className="mt-2">
            <p className="text-sm whitespace-pre-wrap">{item.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
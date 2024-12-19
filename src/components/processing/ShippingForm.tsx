import { useState } from 'react';
import { ShipmentInfo } from '../../types';
import { Truck, Plus, X } from 'lucide-react';
import { generateUniqueId } from '../../utils/uniqueKey';

interface ShippingFormProps {
  shipments: ShipmentInfo[];
  onAddShipment: (shipment: ShipmentInfo) => void;
  onRemoveShipment: (shipmentId: string) => void;
}

export default function ShippingForm({ 
  shipments, 
  onAddShipment, 
  onRemoveShipment 
}: ShippingFormProps) {
  const [newShipment, setNewShipment] = useState<Partial<ShipmentInfo>>({});

  const handleAddShipment = () => {
    if (!newShipment.carrier || !newShipment.trackingNumber) return;

    onAddShipment({
      id: generateUniqueId(),
      carrier: newShipment.carrier,
      trackingNumber: newShipment.trackingNumber,
      date: new Date().toISOString(),
      notes: newShipment.notes
    });
    setNewShipment({});
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-900">
          Shipping Information
        </h4>
        <button
          type="button"
          onClick={handleAddShipment}
          disabled={!newShipment.carrier || !newShipment.trackingNumber}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Shipment
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <select
          value={newShipment.carrier || ''}
          onChange={(e) => setNewShipment({ ...newShipment, carrier: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Select carrier...</option>
          <option value="UPS">UPS</option>
          <option value="FedEx">FedEx</option>
          <option value="USPS">USPS</option>
          <option value="DHL">DHL</option>
        </select>

        <input
          type="text"
          placeholder="Tracking Number"
          value={newShipment.trackingNumber || ''}
          onChange={(e) => setNewShipment({ ...newShipment, trackingNumber: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <input
        type="text"
        placeholder="Notes (optional)"
        value={newShipment.notes || ''}
        onChange={(e) => setNewShipment({ ...newShipment, notes: e.target.value })}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />

      {/* Existing Shipments */}
      {shipments.length > 0 && (
        <div className="space-y-2 mt-4">
          {shipments.map((shipment) => (
            <div key={shipment.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="flex-1">
                <div className="flex items-center">
                  <Truck className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium mr-2">{shipment.carrier}:</span>
                  <span className="text-sm text-gray-600">{shipment.trackingNumber}</span>
                </div>
                {shipment.notes && (
                  <p className="text-xs text-gray-500 mt-1 ml-6">{shipment.notes}</p>
                )}
              </div>
              <button
                onClick={() => onRemoveShipment(shipment.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
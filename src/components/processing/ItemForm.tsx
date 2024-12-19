import { OrderItem } from '../../types';
import ItemDiscrepancyForm from './ItemDiscrepancyForm';
import ItemImageUpload from './ItemImageUpload';
import ShippingForm from './ShippingForm';

interface ItemFormProps {
  item: OrderItem;
  onChange: (item: OrderItem) => void;
}

export default function ItemForm({ item, onChange }: ItemFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <p className="mt-1 text-sm text-gray-900">{item.sku}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">FNSKU</label>
          <p className="mt-1 text-sm text-gray-900">{item.fnsku}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Expected Quantity</label>
          <p className="mt-1 text-sm text-gray-900">{item.expectedQuantity}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Received Quantity</label>
          <input
            type="number"
            value={item.receivedQuantity}
            onChange={(e) => onChange({ ...item, receivedQuantity: parseInt(e.target.value) || 0 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Condition</label>
          <select
            value={item.condition}
            onChange={(e) => onChange({ ...item, condition: e.target.value as OrderItem['condition'] })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="Sellable">Sellable</option>
            <option value="Unsellable">Unsellable</option>
            <option value="Missing">Missing</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          value={item.location || ''}
          onChange={(e) => onChange({ ...item, location: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter storage location"
        />
      </div>

      <ItemImageUpload
        images={item.images || []}
        onAddImage={(image) => onChange({ ...item, images: [...(item.images || []), image] })}
        onRemoveImage={(index) => onChange({
          ...item,
          images: (item.images || []).filter((_, i) => i !== index)
        })}
      />

      <ItemDiscrepancyForm
        discrepancies={item.discrepancies || []}
        onAddDiscrepancy={(discrepancy) => onChange({
          ...item,
          discrepancies: [...(item.discrepancies || []), discrepancy]
        })}
        onRemoveDiscrepancy={(id) => onChange({
          ...item,
          discrepancies: (item.discrepancies || []).filter(d => d.id !== id)
        })}
      />

      <div className="mt-4 pt-4 border-t">
        <ShippingForm
          shipments={item.shipments || []}
          onAddShipment={(shipment) => onChange({
            ...item,
            shipments: [...(item.shipments || []), shipment]
          })}
          onRemoveShipment={(shipmentId) => onChange({
            ...item,
            shipments: (item.shipments || []).filter(s => s.id !== shipmentId)
          })}
        />
      </div>
    </div>
  );
}
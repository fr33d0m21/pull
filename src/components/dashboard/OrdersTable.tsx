import React from 'react';
import { useDashboardItems } from '../../hooks/useDashboardItems';
import { DashboardItem } from '../../types';

export default function OrdersTable() {
    const {
        items,
        isLoading,
        error
    } = useDashboardItems();

    if (isLoading) {
        return <div className="p-4">Loading...</div>;
    }

    if (error) {
        return (
            <div className="p-4 text-red-500">
                Error loading items: {error}
            </div>
        );
    }

    if (!items || items.length === 0) {
        return <div className="p-4">No items found.</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Items from Dashboard Hook</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                SKU
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                FNSKU
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Requested Qty
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actual Qty
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item: DashboardItem) => (
                            <tr key={item.id} className="odd:bg-white even:bg-gray-50">
                                <td className="px-4 py-3 text-sm text-gray-700">
                                    {item.sku}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                    {item.fnsku ?? '—'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                    {item.status}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                    {item.requested_quantity}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                    {item.actual_return_qty}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan={5} className="px-4 py-3 text-sm text-gray-700 font-semibold">
                                Total Items: {items.length}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
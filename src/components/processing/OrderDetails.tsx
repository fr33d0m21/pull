import { useMemo } from 'react';
import { RemovalOrder } from '../../types';
import { format, parseISO } from 'date-fns';
import { Package, AlertTriangle, Clock, CheckCircle, Plus, Minus } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface OrderDetailsProps {
  order: RemovalOrder;
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  const { processOrder } = useData();

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  // Calculate overall stats
  const stats = useMemo(() => {
    const totalExpected = order.requestedQuantity || 0;
    const totalReceived = order.actualReturnQty || 0;
    const isComplete = totalExpected === totalReceived && totalExpected > 0;
    const hasDiscrepancy = totalReceived > 0 && totalReceived !== totalExpected;

    return {
      totalExpected,
      totalReceived,
      isComplete,
      hasDiscrepancy
    };
  }, [order]);

  const handleQuantityChange = (newQuantity: number) => {
    processOrder(order.orderId, {
      ...order,
      actualReturnQty: Math.max(0, newQuantity),
      processingStatus: 'processing'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
          <div className="flex items-center space-x-2">
            {order.processingStatus === 'new' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                New
              </span>
            )}
            {order.processingStatus === 'processing' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Processing
              </span>
            )}
            {order.processingStatus === 'completed' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Order Info Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500">Order ID</label>
            <p className="mt-1 text-sm font-medium">{order.orderId}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Request Date</label>
            <p className="mt-1 text-sm">{formatDate(order.requestDate)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Last Updated</label>
            <p className="mt-1 text-sm">{formatDate(order.lastUpdatedDate)}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Processing Date</label>
            <p className="mt-1 text-sm">{order.processingDate ? formatDate(order.processingDate) : '-'}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 border-b border-gray-200">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Expected Units</p>
              <p className="text-xl font-semibold">{stats.totalExpected}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <CheckCircle className={`h-8 w-8 ${stats.isComplete ? 'text-green-500' : 'text-gray-400'}`} />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Received Units</p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(stats.totalReceived - 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4 text-gray-500" />
                </button>
                <span className="text-xl font-semibold">{stats.totalReceived}</span>
                <button
                  onClick={() => handleQuantityChange(stats.totalReceived + 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            {stats.hasDiscrepancy ? (
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            ) : (
              <Clock className="h-8 w-8 text-gray-400" />
            )}
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="text-xl font-semibold">
                {stats.hasDiscrepancy ? 'Discrepancy' : stats.isComplete ? 'Complete' : 'Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SKU Details */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-4">SKU Details</h4>
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="text-sm font-medium text-gray-900">{order.sku}</h5>
                <p className="text-xs text-gray-500 mt-1">FNSKU: {order.fnsku}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Expected: {order.requestedQuantity}</p>
                <p className="text-sm text-gray-500">Received: {stats.totalReceived}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}